-- Verified deployed function definitions captured 24 October 2026. Test fixture, not migration deployment.
CREATE OR REPLACE FUNCTION public.can_access_patient(_patient uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 SELECT public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'doctor') AND EXISTS (SELECT 1 FROM public.clinical_assignments a WHERE a.patient_id=_patient AND a.doctor_id=auth.uid()));
$function$
;
CREATE OR REPLACE FUNCTION public.create_trusted_order(payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE uid uuid:=auth.uid(); cfg public.store_settings%ROWTYPE; p public.products%ROWTYPE; item jsonb; sub integer:=0; disc integer:=0; total_due integer; code text; rate numeric:=0; oid uuid; ono text; quantity integer; method text;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF jsonb_typeof(payload->'items') IS DISTINCT FROM 'array' OR jsonb_array_length(payload->'items') NOT BETWEEN 1 AND 8 THEN RAISE EXCEPTION 'Invalid basket'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(payload->'items') x GROUP BY x->>'slug' HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate product'; END IF;
 SELECT * INTO STRICT cfg FROM public.store_settings WHERE id='default';
 method:=payload->>'payment_method'; code:=upper(nullif(trim(payload->>'coupon'),''));
 IF method NOT IN ('online','upi','cod') OR method IS NULL OR (method='online' AND NOT cfg.online_payment_enabled) OR (method='upi' AND NOT cfg.upi_enabled) OR (method='cod' AND NOT cfg.cod_enabled) THEN RAISE EXCEPTION 'Payment method unavailable'; END IF;
 IF length(trim(payload->>'customer_name')) NOT BETWEEN 3 AND 120 OR (payload->>'phone') !~ '^[6-9][0-9]{9}$' OR length(payload->>'email') NOT BETWEEN 3 AND 254 OR length(trim(payload->>'address')) NOT BETWEEN 8 AND 1000 OR length(trim(payload->>'city')) NOT BETWEEN 1 AND 120 OR length(trim(payload->>'state')) NOT BETWEEN 1 AND 120 OR (payload->>'pincode') !~ '^[0-9]{6}$' THEN RAISE EXCEPTION 'Invalid delivery details'; END IF;
 IF code IS NOT NULL THEN rate:=CASE code WHEN 'GENTLE10' THEN 0.10 WHEN 'WELCOME5' THEN 0.05 ELSE -1 END; IF rate<0 THEN RAISE EXCEPTION 'Invalid coupon'; END IF; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(payload->'items') ORDER BY value->>'slug' LOOP
  quantity:=(item->>'qty')::integer;
  IF quantity IS NULL OR quantity NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  SELECT * INTO p FROM public.products WHERE slug=item->>'slug' AND is_active AND category='homeopathic-kits' FOR UPDATE;
  IF NOT FOUND OR p.stock<quantity OR p.price<>1500 THEN RAISE EXCEPTION 'Product unavailable'; END IF;
  sub:=sub+p.price*quantity;
 END LOOP;
 disc:=round(sub*rate); total_due:=sub-disc+125;
 IF method='cod' AND (total_due<cfg.cod_min_order OR total_due>cfg.cod_max_order) THEN RAISE EXCEPTION 'COD outside permitted range'; END IF;
 INSERT INTO public.orders(user_id,customer_name,phone,email,address,city,state,pincode,payment_method,subtotal,discount,delivery_fee,total,coupon,notes)
 VALUES(uid,trim(payload->>'customer_name'),payload->>'phone',payload->>'email',trim(payload->>'address'),trim(payload->>'city'),trim(payload->>'state'),payload->>'pincode',method,sub,disc,125,total_due,code,left(payload->>'notes',1000)) RETURNING id,order_no INTO oid,ono;
 FOR item IN SELECT value FROM jsonb_array_elements(payload->'items') LOOP
  SELECT * INTO STRICT p FROM public.products WHERE slug=item->>'slug'; quantity:=(item->>'qty')::integer;
  INSERT INTO public.order_items(order_id,product_id,slug,name,pack,price,qty,line_total) VALUES(oid,p.id,p.slug,p.name,p.pack,p.price,quantity,p.price*quantity);
  UPDATE public.products SET stock=stock-quantity WHERE id=p.id;
 END LOOP;
 RETURN jsonb_build_object('id',oid,'order_no',ono,'total',total_due);
END; $function$
;
CREATE OR REPLACE FUNCTION public.guard_appointment_write()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
 IF auth.role()='service_role' THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.patient_id IS DISTINCT FROM auth.uid() OR NEW.status<>'pending' OR NEW.payment_status<>'pending' OR NEW.doctor_notes IS NOT NULL THEN RAISE EXCEPTION 'Invalid booking'; END IF;
  IF NEW.consultation_type NOT IN ('new','follow-up') THEN RAISE EXCEPTION 'Invalid consultation type'; END IF;
  IF NEW.consultation_type='follow-up' AND NOT EXISTS (SELECT 1 FROM public.appointments a WHERE a.patient_id=auth.uid() AND a.status='completed') THEN RAISE EXCEPTION 'Follow-up requires a previous completed consultation'; END IF;
  NEW.fee:=CASE WHEN NEW.consultation_type='follow-up' THEN 400 ELSE 700 END;
  IF NEW.appointment_date < (now() AT TIME ZONE 'Asia/Kolkata')::date OR NEW.appointment_date > (now() AT TIME ZONE 'Asia/Kolkata')::date + 90 OR NEW.slot NOT IN ('10:00 AM','11:30 AM','01:00 PM','03:30 PM','05:00 PM','06:30 PM') THEN RAISE EXCEPTION 'Invalid appointment schedule'; END IF;
 ELSE
  IF NEW.patient_id IS DISTINCT FROM OLD.patient_id OR NEW.fee IS DISTINCT FROM OLD.fee OR NEW.consultation_type IS DISTINCT FROM OLD.consultation_type OR NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN RAISE EXCEPTION 'Protected appointment fields'; END IF;
  IF NOT public.can_access_patient(OLD.patient_id) THEN
   IF OLD.patient_id IS DISTINCT FROM auth.uid() OR OLD.status NOT IN ('pending','confirmed') OR NEW.status<>'cancelled' OR (to_jsonb(NEW)-'status'-'updated_at') IS DISTINCT FROM (to_jsonb(OLD)-'status'-'updated_at') THEN RAISE EXCEPTION 'Only cancellation is permitted'; END IF;
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NOT ((OLD.status='pending' AND NEW.status IN ('confirmed','cancelled')) OR (OLD.status='confirmed' AND NEW.status IN ('completed','cancelled'))) THEN RAISE EXCEPTION 'Invalid appointment transition'; END IF;
 END IF;
 RETURN NEW;
END; $function$
;
CREATE OR REPLACE FUNCTION public.guard_case_write()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE attachment jsonb;
BEGIN
 IF auth.role()='service_role' THEN RETURN NEW; END IF;
 IF TG_OP='UPDATE' AND (NEW.patient_id IS DISTINCT FROM OLD.patient_id OR NEW.appointment_id IS DISTINCT FROM OLD.appointment_id) THEN RAISE EXCEPTION 'Protected case ownership'; END IF;
 IF NEW.appointment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.appointments a WHERE a.id=NEW.appointment_id AND a.patient_id=NEW.patient_id) THEN RAISE EXCEPTION 'Appointment does not belong to patient'; END IF;
 IF NOT public.can_access_patient(NEW.patient_id) THEN
  IF NEW.patient_id IS DISTINCT FROM auth.uid() OR NEW.status NOT IN ('draft','submitted') OR (TG_OP='UPDATE' AND OLD.status<>'draft') THEN RAISE EXCEPTION 'Invalid patient case operation'; END IF;
 END IF;
 IF jsonb_typeof(NEW.attachments)<>'array' OR jsonb_array_length(NEW.attachments)>20 THEN RAISE EXCEPTION 'Invalid attachments'; END IF;
 FOR attachment IN SELECT value FROM jsonb_array_elements(NEW.attachments) LOOP
  IF (attachment->>'path') NOT LIKE NEW.patient_id::text || '/%' OR (attachment->>'path') LIKE '%..%' THEN RAISE EXCEPTION 'Invalid attachment owner'; END IF;
 END LOOP;
 RETURN NEW;
END; $function$
;
CREATE OR REPLACE FUNCTION public.guard_payment_write()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE expected integer;
BEGIN
 IF auth.role()='service_role' THEN RETURN NEW; END IF;
 IF public.has_role(auth.uid(),'admin') THEN
  IF NEW.gateway='razorpay' AND (TG_OP='INSERT' OR NEW.status IS DISTINCT FROM OLD.status OR NEW.amount IS DISTINCT FROM OLD.amount OR NEW.gateway_order_id IS DISTINCT FROM OLD.gateway_order_id OR NEW.gateway_payment_id IS DISTINCT FROM OLD.gateway_payment_id) THEN RAISE EXCEPTION 'Gateway settlement is server-only'; END IF;
  RETURN NEW;
 END IF;
 IF TG_OP<>'INSERT' OR NEW.user_id IS DISTINCT FROM auth.uid() OR NEW.status<>'pending' OR NEW.gateway IS DISTINCT FROM 'manual' OR NEW.recorded_by IS NOT NULL OR NEW.refund_amount<>0 OR NEW.refund_status<>'none' OR NEW.gateway_order_id IS NOT NULL OR NEW.method NOT IN ('upi','card','netbanking') THEN RAISE EXCEPTION 'Invalid payment attempt'; END IF;
 IF NEW.kind='order' AND NEW.order_id IS NOT NULL AND NEW.appointment_id IS NULL THEN SELECT total INTO expected FROM public.orders WHERE id=NEW.order_id AND user_id=auth.uid() AND status<>'cancelled' AND payment_status IN ('pending','failed');
 ELSIF NEW.kind='consultation' AND NEW.appointment_id IS NOT NULL AND NEW.order_id IS NULL THEN SELECT fee INTO expected FROM public.appointments WHERE id=NEW.appointment_id AND patient_id=auth.uid() AND status<>'cancelled' AND payment_status IN ('pending','failed');
 ELSE RAISE EXCEPTION 'Invalid payment resource'; END IF;
 IF expected IS NULL OR expected<=0 THEN RAISE EXCEPTION 'Nothing payable'; END IF;
 NEW.amount:=expected;
 RETURN NEW;
END; $function$
;
CREATE OR REPLACE FUNCTION public.guard_prescription_write()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
 IF auth.role()='service_role' THEN RETURN NEW; END IF;
 IF NOT public.can_access_patient(NEW.patient_id) OR NEW.doctor_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Clinical access required'; END IF;
 IF NEW.appointment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.appointments a WHERE a.id=NEW.appointment_id AND a.patient_id=NEW.patient_id) THEN RAISE EXCEPTION 'Invalid prescription appointment'; END IF;
 IF TG_OP='UPDATE' AND (NEW.patient_id IS DISTINCT FROM OLD.patient_id OR NEW.appointment_id IS DISTINCT FROM OLD.appointment_id) THEN RAISE EXCEPTION 'Protected prescription ownership'; END IF;
 RETURN NEW;
END; $function$
;
CREATE OR REPLACE FUNCTION public.settle_gateway_payment(_payment uuid, _user uuid, _gateway_order text, _gateway_payment text, _amount integer, _method text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE p public.payments%ROWTYPE; bill_amount integer; bill_status text;
BEGIN
 SELECT * INTO STRICT p FROM public.payments WHERE id=_payment FOR UPDATE;
 IF p.user_id<>_user OR p.gateway IS DISTINCT FROM 'razorpay' OR p.gateway_order_id IS DISTINCT FROM _gateway_order OR p.amount<>_amount THEN RAISE EXCEPTION 'Payment binding mismatch'; END IF;
 IF p.status='paid' THEN IF p.gateway_payment_id IS DISTINCT FROM _gateway_payment THEN RAISE EXCEPTION 'Payment already settled'; END IF; RETURN; END IF;
 IF EXISTS (SELECT 1 FROM public.payments WHERE gateway='razorpay' AND gateway_payment_id=_gateway_payment AND id<>p.id) THEN RAISE EXCEPTION 'Payment already used'; END IF;
 IF p.kind='order' AND p.order_id IS NOT NULL AND p.appointment_id IS NULL THEN
  SELECT total,payment_status::text INTO bill_amount,bill_status FROM public.orders WHERE id=p.order_id AND user_id=_user AND status<>'cancelled' FOR UPDATE;
  IF bill_amount IS DISTINCT FROM _amount OR bill_status NOT IN ('pending','failed') THEN RAISE EXCEPTION 'Order not payable'; END IF;
  UPDATE public.orders SET payment_status='paid' WHERE id=p.order_id;
 ELSIF p.kind='consultation' AND p.appointment_id IS NOT NULL AND p.order_id IS NULL THEN
  SELECT fee,payment_status::text INTO bill_amount,bill_status FROM public.appointments WHERE id=p.appointment_id AND patient_id=_user AND status<>'cancelled' FOR UPDATE;
  IF bill_amount IS DISTINCT FROM _amount OR bill_status NOT IN ('pending','failed') THEN RAISE EXCEPTION 'Appointment not payable'; END IF;
  UPDATE public.appointments SET payment_status='paid' WHERE id=p.appointment_id;
 ELSE RAISE EXCEPTION 'Invalid payment resource'; END IF;
 UPDATE public.payments SET status='paid',gateway_payment_id=_gateway_payment,method=_method,failure_reason=NULL WHERE id=p.id;
END; $function$
;