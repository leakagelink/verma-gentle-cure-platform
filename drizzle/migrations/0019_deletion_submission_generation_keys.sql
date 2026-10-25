ALTER TABLE public.account_deletion_requests ADD COLUMN IF NOT EXISTS submission_keys uuid[] NOT NULL DEFAULT '{}';
CREATE OR REPLACE FUNCTION public.submit_deletion_request(_scope text,_submission uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.account_deletion_requests%ROWTYPE; uid uuid:=auth.uid();
BEGIN
 IF uid IS NULL OR _scope IS NULL OR _scope NOT IN ('account','data') OR _submission IS NULL THEN RAISE EXCEPTION 'Verified request required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,4917));
 SELECT * INTO r FROM public.account_deletion_requests WHERE user_id=uid AND scope=_scope FOR UPDATE;
 IF FOUND THEN
  IF _submission=ANY(r.submission_keys) THEN RETURN jsonb_build_object('id',r.id,'status',r.status,'processing_state',r.processing_state,'created_at',r.created_at); END IF;
  IF cardinality(r.submission_keys)>=1000 THEN RAISE EXCEPTION 'Request history requires clinic review'; END IF;
  IF _scope='data' AND r.processing_state='completed' THEN
   UPDATE public.account_deletion_requests SET processing_history=processing_history||jsonb_build_array(jsonb_build_object('completed_at',completed_at,'token',processing_token,'state',processing_state)),processing_state='pending',status='pending',processing_token=NULL,completed_at=NULL,failure_code=NULL,submission_keys=array_append(submission_keys,_submission) WHERE id=r.id RETURNING * INTO r;
  ELSE
   UPDATE public.account_deletion_requests SET submission_keys=array_append(submission_keys,_submission) WHERE id=r.id RETURNING * INTO r;
  END IF;
 ELSE
  INSERT INTO public.account_deletion_requests(user_id,scope,submission_keys) VALUES(uid,_scope,ARRAY[_submission]) RETURNING * INTO r;
 END IF;
 RETURN jsonb_build_object('id',r.id,'status',r.status,'processing_state',r.processing_state,'created_at',r.created_at);
END; $$;
REVOKE ALL ON FUNCTION public.submit_deletion_request(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_deletion_request(text,uuid) TO authenticated;
COMMENT ON COLUMN public.account_deletion_requests.submission_keys IS 'Owner-bound action keys: retrying any acknowledged submission never reopens a completed deletion generation. No contact or health data.';