CREATE OR REPLACE FUNCTION public.claim_account_deletion(_request uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.account_deletion_requests%ROWTYPE; ticket uuid; uid uuid;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator required'; END IF;
 SELECT user_id INTO STRICT uid FROM public.account_deletion_requests WHERE id=_request;
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,4917));
 SELECT * INTO STRICT r FROM public.account_deletion_requests WHERE id=_request FOR UPDATE;
 IF r.processing_state='completed' THEN RETURN jsonb_build_object('state','completed'); END IF;
 IF r.processing_state IN ('processing','failed') THEN RAISE EXCEPTION 'Deletion already processing or failed; reconcile before retry'; END IF;
 IF EXISTS(SELECT 1 FROM public.account_deletion_requests WHERE user_id=uid AND id<>r.id AND (processing_state IN ('processing','failed') OR (scope='account' AND processing_state='completed'))) THEN RAISE EXCEPTION 'Another deletion requires reconciliation'; END IF;
 IF public.deletion_has_retained_dependencies(r.user_id) THEN UPDATE public.account_deletion_requests SET processing_state='blocked',failure_code='retention_review_required' WHERE id=r.id; RETURN jsonb_build_object('state','blocked'); END IF;
 ticket:=gen_random_uuid();
 UPDATE public.account_deletion_requests SET processing_state='processing',processing_token=ticket,failure_code=NULL WHERE id=r.id;
 RETURN jsonb_build_object('state','processing','token',ticket,'user_id',r.user_id,'scope',r.scope);
END; $$;
REVOKE ALL ON FUNCTION public.claim_account_deletion(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.claim_account_deletion(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.finish_deletion_generation(_request uuid,_token uuid,_state text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.account_deletion_requests%ROWTYPE;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' OR _state NOT IN ('completed','failed') THEN RAISE EXCEPTION 'Service transition required'; END IF;
 SELECT * INTO STRICT r FROM public.account_deletion_requests WHERE id=_request AND processing_token=_token FOR UPDATE;
 IF r.processing_state='completed' THEN RETURN 'completed'; END IF;
 IF r.processing_state='failed' AND _state='failed' THEN RETURN 'failed'; END IF;
 IF r.processing_state<>'processing' THEN RAISE EXCEPTION 'Generation is not processing'; END IF;
 UPDATE public.account_deletion_requests SET processing_state=_state,completed_at=CASE WHEN _state='completed' THEN now() ELSE NULL END,failure_code=CASE WHEN _state='failed' THEN 'processing_failed_requires_reconciliation' ELSE NULL END WHERE id=r.id;
 RETURN _state;
END; $$;
REVOKE ALL ON FUNCTION public.finish_deletion_generation(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_deletion_generation(uuid,uuid,text) TO service_role;
COMMENT ON FUNCTION public.finish_deletion_generation(uuid,uuid,text) IS 'Idempotent token-bound completion/failure receipt. The authorized processor must independently verify Auth, profile and Storage deletion before requesting completion. Never downgrades a completed generation.';