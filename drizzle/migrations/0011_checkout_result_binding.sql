CREATE OR REPLACE FUNCTION public.create_idempotent_order(payload jsonb,_request uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE existing public.checkout_requests%ROWTYPE; order_result jsonb;
BEGIN
 IF auth.uid() IS NULL OR _request IS NULL THEN RAISE EXCEPTION 'Sign in and request required'; END IF;
 INSERT INTO public.checkout_requests(user_id,request_id,payload) VALUES(auth.uid(),_request,payload) ON CONFLICT DO NOTHING;
 SELECT * INTO STRICT existing FROM public.checkout_requests WHERE user_id=auth.uid() AND request_id=_request FOR UPDATE;
 IF existing.payload IS DISTINCT FROM payload THEN RAISE EXCEPTION 'Request already used for different basket'; END IF;
 IF existing.result IS NOT NULL THEN RETURN existing.result; END IF;
 IF payload ?| ARRAY['total','subtotal','discount','delivery_fee','payment_status','user_id'] OR EXISTS(SELECT 1 FROM jsonb_array_elements(payload->'items') i WHERE i ?| ARRAY['price','line_total']) THEN RAISE EXCEPTION 'Protected order fields'; END IF;
 order_result:=public.create_trusted_order(payload);
 UPDATE public.checkout_requests SET result=order_result WHERE user_id=auth.uid() AND request_id=_request;
 RETURN order_result;
END; $$;