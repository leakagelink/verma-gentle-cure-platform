CREATE OR REPLACE FUNCTION public.submit_patient_payment(payload jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE pid uuid; expected integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF payload ?| ARRAY['user_id','amount','status','gateway','gateway_order_id','recorded_by','refund_amount'] THEN RAISE EXCEPTION 'Protected payment fields'; END IF;
 IF coalesce(length(trim(payload->>'reference')),0) NOT BETWEEN 4 AND 100 OR coalesce(payload->>'method','') NOT IN ('upi','card','netbanking') THEN RAISE EXCEPTION 'Invalid reference'; END IF;
 IF payload->>'kind'='order' AND payload->>'order_id' IS NOT NULL AND payload->>'appointment_id' IS NULL THEN
 SELECT total INTO expected FROM public.orders WHERE id=(payload->>'order_id')::uuid AND user_id=auth.uid() AND status<>'cancelled' AND payment_status IN ('pending','failed');
 ELSIF payload->>'kind'='consultation' AND payload->>'appointment_id' IS NOT NULL AND payload->>'order_id' IS NULL THEN
 SELECT fee INTO expected FROM public.appointments WHERE id=(payload->>'appointment_id')::uuid AND patient_id=auth.uid() AND status<>'cancelled' AND payment_status IN ('pending','failed');
 ELSE RAISE EXCEPTION 'Invalid payment resource'; END IF;
 IF expected IS NULL OR expected<=0 THEN RAISE EXCEPTION 'Nothing payable'; END IF;
 INSERT INTO public.payments(user_id,kind,appointment_id,order_id,amount,method,status,gateway,gateway_payment_id)
 VALUES(auth.uid(),payload->>'kind',(payload->>'appointment_id')::uuid,(payload->>'order_id')::uuid,expected,payload->>'method','pending','manual',trim(payload->>'reference')) RETURNING id INTO pid;
 RETURN pid;
END; $$;
CREATE OR REPLACE FUNCTION public.review_manual_payment(_payment uuid,payload jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.payments%ROWTYPE; new_status public.payment_status;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Verified server review required'; END IF;
 IF payload - ARRAY['status','refund_status','refund_amount','refund_note'] <> '{}'::jsonb THEN RAISE EXCEPTION 'Protected payment fields'; END IF;
 SELECT * INTO STRICT p FROM public.payments WHERE id=_payment FOR UPDATE;
 new_status:=coalesce((payload->>'status')::public.payment_status,p.status);
 IF p.gateway='razorpay' AND (new_status IS DISTINCT FROM p.status OR payload ? 'refund_amount' OR payload ? 'refund_status') THEN RAISE EXCEPTION 'Gateway settlement and refunds require provider verification'; END IF;
 IF payload ? 'refund_amount' AND ((payload->>'refund_amount')::integer<0 OR (payload->>'refund_amount')::integer>p.amount) THEN RAISE EXCEPTION 'Invalid refund amount'; END IF;
 IF new_status='paid' AND p.status NOT IN ('pending','paid') THEN RAISE EXCEPTION 'Invalid paid transition'; END IF;
 IF new_status='paid' AND p.status<>'paid' THEN
  IF p.order_id IS NOT NULL AND p.appointment_id IS NULL THEN
   UPDATE public.orders SET payment_status='paid' WHERE id=p.order_id AND user_id=p.user_id AND total=p.amount AND status<>'cancelled' AND payment_status IN ('pending','failed');
   IF NOT FOUND THEN RAISE EXCEPTION 'Order not payable'; END IF;
  ELSIF p.appointment_id IS NOT NULL AND p.order_id IS NULL THEN
   UPDATE public.appointments SET payment_status='paid' WHERE id=p.appointment_id AND patient_id=p.user_id AND fee=p.amount AND status<>'cancelled' AND payment_status IN ('pending','failed');
   IF NOT FOUND THEN RAISE EXCEPTION 'Appointment not payable'; END IF;
  ELSIF p.gateway IS DISTINCT FROM 'counter' THEN RAISE EXCEPTION 'Invalid resource'; END IF;
 END IF;
 UPDATE public.payments SET status=new_status,refund_amount=coalesce((payload->>'refund_amount')::integer,p.refund_amount),refund_status=coalesce(payload->>'refund_status',p.refund_status),refund_note=CASE WHEN payload ? 'refund_note' THEN left(payload->>'refund_note',1000) ELSE p.refund_note END WHERE id=p.id;
END; $$;
REVOKE ALL ON FUNCTION public.review_manual_payment(uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.review_manual_payment(uuid,jsonb) TO service_role;