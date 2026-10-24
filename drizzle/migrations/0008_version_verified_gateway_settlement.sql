-- Recovered byte-for-byte from pg_get_functiondef(public.settle_gateway_payment) on 24 October 2026.
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
END; $function$;
REVOKE ALL ON FUNCTION public.settle_gateway_payment(uuid,uuid,text,text,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.settle_gateway_payment(uuid,uuid,text,text,integer,text) TO service_role;