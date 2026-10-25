CREATE TABLE IF NOT EXISTS public.clinical_assignments(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),patient_id uuid NOT NULL,doctor_id uuid NOT NULL,assigned_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(patient_id,doctor_id));
GRANT SELECT,INSERT,DELETE ON public.clinical_assignments TO authenticated;
GRANT ALL ON public.clinical_assignments TO service_role;
ALTER TABLE public.clinical_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS consultation_type text NOT NULL DEFAULT 'new';
CREATE OR REPLACE FUNCTION public.can_access_patient(_patient uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'doctor') AND EXISTS(SELECT 1 FROM public.clinical_assignments a WHERE a.patient_id=_patient AND a.doctor_id=auth.uid())); $$;
REVOKE ALL ON FUNCTION public.can_access_patient(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_access_patient(uuid) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.guard_appointment_write() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.role()='service_role' THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.patient_id IS DISTINCT FROM auth.uid() OR NEW.status<>'pending' OR NEW.payment_status<>'pending' OR NEW.doctor_notes IS NOT NULL THEN RAISE EXCEPTION 'Invalid booking'; END IF;
  IF NEW.consultation_type NOT IN ('new','follow-up') THEN RAISE EXCEPTION 'Invalid consultation type'; END IF;
  IF NEW.consultation_type='follow-up' AND NOT EXISTS(SELECT 1 FROM public.appointments a WHERE a.patient_id=auth.uid() AND a.status='completed') THEN RAISE EXCEPTION 'Follow-up requires a previous completed consultation'; END IF;
  NEW.fee:=CASE WHEN NEW.consultation_type='follow-up' THEN 400 ELSE 700 END;
  IF NEW.appointment_date<(now() AT TIME ZONE 'Asia/Kolkata')::date OR NEW.appointment_date>(now() AT TIME ZONE 'Asia/Kolkata')::date+90 OR NEW.slot NOT IN ('10:00 AM','11:30 AM','01:00 PM','03:30 PM','05:00 PM','06:30 PM') THEN RAISE EXCEPTION 'Invalid appointment schedule'; END IF;
 ELSE
  IF NEW.patient_id IS DISTINCT FROM OLD.patient_id OR NEW.fee IS DISTINCT FROM OLD.fee OR NEW.consultation_type IS DISTINCT FROM OLD.consultation_type OR NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN RAISE EXCEPTION 'Protected appointment fields'; END IF;
  IF NOT public.can_access_patient(OLD.patient_id) THEN
   IF OLD.patient_id IS DISTINCT FROM auth.uid() OR OLD.status NOT IN ('pending','confirmed') OR NEW.status<>'cancelled' OR (to_jsonb(NEW)-'status'-'updated_at') IS DISTINCT FROM (to_jsonb(OLD)-'status'-'updated_at') THEN RAISE EXCEPTION 'Only cancellation is permitted'; END IF;
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NOT ((OLD.status='pending' AND NEW.status IN ('confirmed','cancelled')) OR (OLD.status='confirmed' AND NEW.status IN ('completed','cancelled'))) THEN RAISE EXCEPTION 'Invalid appointment transition'; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE OR REPLACE TRIGGER appointment_security BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.guard_appointment_write();
REVOKE ALL ON FUNCTION public.guard_appointment_write() FROM PUBLIC,anon,authenticated;
DROP POLICY IF EXISTS clinical_appointment_scope ON public.appointments;
CREATE POLICY clinical_appointment_scope ON public.appointments AS RESTRICTIVE FOR ALL TO authenticated USING(patient_id=auth.uid() OR public.can_access_patient(patient_id)) WITH CHECK(patient_id=auth.uid() OR public.can_access_patient(patient_id));
CREATE OR REPLACE FUNCTION public.create_trusted_order(payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=auth.uid(); cfg public.store_settings%ROWTYPE; p public.products%ROWTYPE; item jsonb; sub integer:=0; disc integer:=0; total_due integer; code text; rate numeric:=0; oid uuid; ono text; quantity integer; method text;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF jsonb_typeof(payload->'items') IS DISTINCT FROM 'array' OR jsonb_array_length(payload->'items') NOT BETWEEN 1 AND 8 THEN RAISE EXCEPTION 'Invalid basket'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(payload->'items') x GROUP BY x->>'slug' HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate product'; END IF;
 SELECT * INTO STRICT cfg FROM public.store_settings WHERE id='default';
 method:=payload->>'payment_method'; code:=upper(nullif(trim(payload->>'coupon'),''));
 IF method NOT IN ('online','upi','cod') OR method IS NULL OR (method='online' AND NOT cfg.online_payment_enabled) OR (method='upi' AND NOT cfg.upi_enabled) OR (method='cod' AND NOT cfg.cod_enabled) THEN RAISE EXCEPTION 'Payment method unavailable'; END IF;
 IF coalesce(length(trim(payload->>'customer_name')),0) NOT BETWEEN 3 AND 120 OR coalesce(payload->>'phone','') !~ '^[6-9][0-9]{9}$' OR coalesce(payload->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR coalesce(length(trim(payload->>'address')),0) NOT BETWEEN 8 AND 1000 OR coalesce(length(trim(payload->>'city')),0) NOT BETWEEN 1 AND 120 OR coalesce(length(trim(payload->>'state')),0) NOT BETWEEN 1 AND 120 OR coalesce(payload->>'pincode','') !~ '^[0-9]{6}$' THEN RAISE EXCEPTION 'Invalid delivery details'; END IF;
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
END; $$;
REVOKE ALL ON FUNCTION public.create_trusted_order(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_trusted_order(jsonb) TO service_role;
REVOKE INSERT ON public.orders,public.order_items,public.appointments FROM authenticated;
REVOKE INSERT,UPDATE ON public.payments FROM authenticated;