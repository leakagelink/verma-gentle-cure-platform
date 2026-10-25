CREATE TABLE public.checkout_requests(user_id uuid NOT NULL, request_id uuid NOT NULL, payload jsonb NOT NULL, result jsonb, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,request_id));
GRANT ALL ON public.checkout_requests TO service_role;
ALTER TABLE public.checkout_requests ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.create_idempotent_order(payload jsonb,_request uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE existing public.checkout_requests%ROWTYPE; result jsonb;
BEGIN
 IF auth.uid() IS NULL OR _request IS NULL THEN RAISE EXCEPTION 'Sign in and request required'; END IF;
 INSERT INTO public.checkout_requests(user_id,request_id,payload) VALUES(auth.uid(),_request,payload) ON CONFLICT DO NOTHING;
 SELECT * INTO STRICT existing FROM public.checkout_requests WHERE user_id=auth.uid() AND request_id=_request FOR UPDATE;
 IF existing.payload IS DISTINCT FROM payload THEN RAISE EXCEPTION 'Request already used for different basket'; END IF;
 IF existing.result IS NOT NULL THEN RETURN existing.result; END IF;
 IF payload ?| ARRAY['total','subtotal','discount','delivery_fee','payment_status','user_id'] OR EXISTS(SELECT 1 FROM jsonb_array_elements(payload->'items') i WHERE i ?| ARRAY['price','line_total']) THEN RAISE EXCEPTION 'Protected order fields'; END IF;
 result:=public.create_trusted_order(payload);
 UPDATE public.checkout_requests SET result=result WHERE user_id=auth.uid() AND request_id=_request;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.create_idempotent_order(jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_idempotent_order(jsonb,uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_trusted_order(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_trusted_order(jsonb) TO service_role;
CREATE TABLE public.gateway_initiations(user_id uuid NOT NULL, kind text NOT NULL, resource_id uuid NOT NULL, token uuid NOT NULL DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), payment_id uuid, PRIMARY KEY(user_id,kind,resource_id));
GRANT ALL ON public.gateway_initiations TO service_role;
ALTER TABLE public.gateway_initiations ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.claim_gateway_initiation(_user uuid,_kind text,_resource uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE claim uuid;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' OR _kind NOT IN ('order','consultation') THEN RAISE EXCEPTION 'Service required'; END IF;
 IF _kind='order' THEN
  PERFORM 1 FROM public.orders WHERE id=_resource AND user_id=_user AND status<>'cancelled' AND payment_status IN ('pending','failed') FOR UPDATE;
 ELSE
  PERFORM 1 FROM public.appointments WHERE id=_resource AND patient_id=_user AND status<>'cancelled' AND payment_status IN ('pending','failed') FOR UPDATE;
 END IF;
 IF NOT FOUND THEN RAISE EXCEPTION 'Resource not payable'; END IF;
 INSERT INTO public.gateway_initiations(user_id,kind,resource_id) VALUES(_user,_kind,_resource) ON CONFLICT DO NOTHING RETURNING token INTO claim;
 IF claim IS NULL THEN RAISE EXCEPTION 'Payment initialization already recorded; retry existing payment or contact clinic'; END IF;
 RETURN claim;
END; $$;
REVOKE ALL ON FUNCTION public.claim_gateway_initiation(uuid,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_gateway_initiation(uuid,text,uuid) TO service_role;