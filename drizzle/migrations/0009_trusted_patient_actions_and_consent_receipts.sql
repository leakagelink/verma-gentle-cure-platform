CREATE TABLE public.health_consent_receipts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, purpose text NOT NULL CHECK(purpose IN ('appointment','case')), notice_version text NOT NULL, accepted_at timestamptz NOT NULL DEFAULT now(), consumed_at timestamptz);
GRANT SELECT ON public.health_consent_receipts TO authenticated;
GRANT ALL ON public.health_consent_receipts TO service_role;
ALTER TABLE public.health_consent_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY consent_owner_read ON public.health_consent_receipts FOR SELECT TO authenticated USING(user_id=auth.uid());
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS health_consent_receipt_id uuid;
ALTER TABLE public.case_records ADD COLUMN IF NOT EXISTS health_consent_receipt_id uuid;
CREATE OR REPLACE FUNCTION public.require_health_consent() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE receipt public.health_consent_receipts%ROWTYPE; purpose_name text;
BEGIN
 IF auth.role()='service_role' THEN RETURN NEW; END IF;
 IF NEW.patient_id IS DISTINCT FROM auth.uid() AND public.can_access_patient(NEW.patient_id) THEN
  IF TG_OP='UPDATE' THEN NEW.health_consent_at:=OLD.health_consent_at; NEW.health_notice_version:=OLD.health_notice_version; NEW.health_consent_receipt_id:=OLD.health_consent_receipt_id; END IF;
  RETURN NEW;
 END IF;
 IF NEW.patient_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Patient consent required'; END IF;
 purpose_name:=CASE WHEN TG_TABLE_NAME='appointments' THEN 'appointment' ELSE 'case' END;
 SELECT * INTO receipt FROM public.health_consent_receipts WHERE id=NEW.health_consent_receipt_id AND user_id=auth.uid() AND purpose=purpose_name FOR UPDATE;
 IF NOT FOUND OR receipt.consumed_at IS NOT NULL OR receipt.notice_version IS DISTINCT FROM 'health-2026-10-24' OR receipt.accepted_at<now()-interval '15 minutes' OR receipt.accepted_at>now() THEN RAISE EXCEPTION 'Current server-recorded consent required'; END IF;
 IF NEW.health_notice_version IS NOT NULL AND NEW.health_notice_version IS DISTINCT FROM receipt.notice_version THEN RAISE EXCEPTION 'Invalid notice version'; END IF;
 IF NEW.health_consent_at IS NOT NULL AND NEW.health_consent_at IS DISTINCT FROM receipt.accepted_at THEN RAISE EXCEPTION 'Consent timestamp is server-managed'; END IF;
 NEW.health_consent_at:=receipt.accepted_at; NEW.health_notice_version:=receipt.notice_version;
 UPDATE public.health_consent_receipts SET consumed_at=now() WHERE id=receipt.id;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.require_health_consent() FROM PUBLIC,anon,authenticated;
DROP POLICY IF EXISTS "Patients can update their pending appointments" ON public.appointments;
REVOKE INSERT ON public.appointments FROM authenticated;
CREATE OR REPLACE FUNCTION public.book_patient_appointment(payload jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE aid uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF payload ?| ARRAY['patient_id','fee','status','payment_status','doctor_notes','health_consent_at'] THEN RAISE EXCEPTION 'Protected booking fields'; END IF;
 IF coalesce(length(trim(payload->>'patient_name')),0) NOT BETWEEN 3 AND 120 OR coalesce(payload->>'phone','') !~ '^[6-9][0-9]{9}$' OR coalesce(length(payload->>'concern'),0) NOT BETWEEN 4 AND 10000 THEN RAISE EXCEPTION 'Invalid booking details'; END IF;
 INSERT INTO public.appointments(patient_id,patient_name,phone,email,date_of_birth,gender,mode,appointment_date,slot,concern,medical_history,current_medication,allergies,consultation_type,fee,health_consent_receipt_id)
 VALUES(auth.uid(),trim(payload->>'patient_name'),payload->>'phone',payload->>'email',(payload->>'date_of_birth')::date,payload->>'gender',(payload->>'mode')::public.consultation_mode,(payload->>'appointment_date')::date,payload->>'slot',payload->>'concern',payload->>'medical_history',payload->>'current_medication',payload->>'allergies',payload->>'consultation_type',0,(payload->>'health_consent_receipt_id')::uuid) RETURNING id INTO aid;
 RETURN aid;
END; $$;
REVOKE ALL ON FUNCTION public.book_patient_appointment(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.book_patient_appointment(jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.cancel_patient_appointment(_appointment uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 UPDATE public.appointments SET status='cancelled' WHERE id=_appointment AND patient_id=auth.uid() AND status IN ('pending','confirmed');
 IF NOT FOUND THEN RAISE EXCEPTION 'Appointment not cancellable'; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.cancel_patient_appointment(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cancel_patient_appointment(uuid) TO authenticated;
REVOKE INSERT,UPDATE ON public.payments FROM authenticated;
CREATE OR REPLACE FUNCTION public.submit_patient_payment(payload jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE pid uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF payload ?| ARRAY['user_id','amount','status','gateway','gateway_order_id','recorded_by','refund_amount'] THEN RAISE EXCEPTION 'Protected payment fields'; END IF;
 IF coalesce(length(trim(payload->>'reference')),0) NOT BETWEEN 4 AND 100 THEN RAISE EXCEPTION 'Invalid reference'; END IF;
 INSERT INTO public.payments(user_id,kind,appointment_id,order_id,amount,method,status,gateway,gateway_payment_id)
 VALUES(auth.uid(),payload->>'kind',(payload->>'appointment_id')::uuid,(payload->>'order_id')::uuid,0,payload->>'method','pending','manual',trim(payload->>'reference')) RETURNING id INTO pid;
 RETURN pid;
END; $$;
REVOKE ALL ON FUNCTION public.submit_patient_payment(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_patient_payment(jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.record_counter_payment(payload jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE pid uuid;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator required'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=(payload->>'user_id')::uuid) OR coalesce((payload->>'amount')::integer,0) NOT BETWEEN 1 AND 1000000 OR coalesce(payload->>'method','') NOT IN ('cash','upi','card','netbanking','cod') OR coalesce(payload->>'kind','') NOT IN ('consultation','order') OR coalesce(length(trim(payload->>'payer_name')),0) NOT BETWEEN 3 AND 120 THEN RAISE EXCEPTION 'Invalid counter entry'; END IF;
 INSERT INTO public.payments(user_id,kind,amount,method,status,payer_name,notes,recorded_by,gateway)
 VALUES((payload->>'user_id')::uuid,payload->>'kind',(payload->>'amount')::integer,payload->>'method','paid',trim(payload->>'payer_name'),left(payload->>'notes',1000),auth.uid(),'counter') RETURNING id INTO pid;
 RETURN pid;
END; $$;
REVOKE ALL ON FUNCTION public.record_counter_payment(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_counter_payment(jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.review_manual_payment(_payment uuid,payload jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.payments%ROWTYPE; new_status public.payment_status;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator required'; END IF;
 IF payload - ARRAY['status','refund_status','refund_amount','refund_note'] <> '{}'::jsonb THEN RAISE EXCEPTION 'Protected payment fields'; END IF;
 SELECT * INTO STRICT p FROM public.payments WHERE id=_payment FOR UPDATE;
 new_status:=coalesce((payload->>'status')::public.payment_status,p.status);
 IF p.gateway='razorpay' AND new_status IS DISTINCT FROM p.status THEN RAISE EXCEPTION 'Gateway settlement is server-only'; END IF;
 IF payload ? 'refund_amount' AND ((payload->>'refund_amount')::integer<0 OR (payload->>'refund_amount')::integer>p.amount) THEN RAISE EXCEPTION 'Invalid refund amount'; END IF;
 IF new_status='paid' AND p.status<>'paid' THEN
  IF p.order_id IS NOT NULL THEN
   UPDATE public.orders SET payment_status='paid' WHERE id=p.order_id AND user_id=p.user_id AND total=p.amount AND status<>'cancelled' AND payment_status IN ('pending','failed');
   IF NOT FOUND THEN RAISE EXCEPTION 'Order not payable'; END IF;
  ELSIF p.appointment_id IS NOT NULL THEN RAISE EXCEPTION 'Consultation settlement requires verified server workflow'; END IF;
 END IF;
 UPDATE public.payments SET status=new_status,refund_amount=coalesce((payload->>'refund_amount')::integer,p.refund_amount),refund_status=coalesce(payload->>'refund_status',p.refund_status),refund_note=CASE WHEN payload ? 'refund_note' THEN left(payload->>'refund_note',1000) ELSE p.refund_note END WHERE id=p.id;
END; $$;
REVOKE ALL ON FUNCTION public.review_manual_payment(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_manual_payment(uuid,jsonb) TO authenticated;
REVOKE INSERT ON public.orders,public.order_items FROM authenticated;