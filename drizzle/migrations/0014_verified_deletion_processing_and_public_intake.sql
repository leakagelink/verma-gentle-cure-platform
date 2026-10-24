ALTER TABLE public.account_deletion_requests ADD COLUMN IF NOT EXISTS processing_state text NOT NULL DEFAULT 'pending' CHECK (processing_state IN ('pending','processing','blocked','failed','completed'));
ALTER TABLE public.account_deletion_requests ADD COLUMN IF NOT EXISTS processing_token uuid;
ALTER TABLE public.account_deletion_requests ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.account_deletion_requests ADD COLUMN IF NOT EXISTS failure_code text;
REVOKE INSERT,UPDATE ON public.account_deletion_requests FROM authenticated;
CREATE TABLE public.external_deletion_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),contact text NOT NULL CHECK(length(contact) BETWEEN 5 AND 254),scope text NOT NULL CHECK(scope IN ('account','data')),state text NOT NULL DEFAULT 'unverified' CHECK(state IN ('unverified','verified','closed')),created_at timestamptz NOT NULL DEFAULT now(),rate_key text NOT NULL, UNIQUE(rate_key));
GRANT SELECT ON public.external_deletion_requests TO authenticated;
GRANT ALL ON public.external_deletion_requests TO service_role;
ALTER TABLE public.external_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY external_deletion_admin_read ON public.external_deletion_requests FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
COMMENT ON TABLE public.external_deletion_requests IS 'Public unverified intake. Must verify ownership using registered contact before requesting destructive processing. No public read or direct insert grant.';
CREATE OR REPLACE FUNCTION public.claim_account_deletion(_request uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.account_deletion_requests%ROWTYPE; ticket uuid;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator required'; END IF;
 SELECT * INTO STRICT r FROM public.account_deletion_requests WHERE id=_request FOR UPDATE;
 IF r.processing_state='completed' THEN RETURN jsonb_build_object('state','completed'); END IF;
 IF r.processing_state='processing' THEN RAISE EXCEPTION 'Deletion already processing; reconcile before retry'; END IF;
 IF EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=r.user_id AND role<>'patient') OR EXISTS(SELECT 1 FROM public.appointments WHERE patient_id=r.user_id) OR EXISTS(SELECT 1 FROM public.case_records WHERE patient_id=r.user_id) OR EXISTS(SELECT 1 FROM public.prescriptions WHERE patient_id=r.user_id OR doctor_id=r.user_id) OR EXISTS(SELECT 1 FROM public.case_clinical_notes WHERE doctor_id=r.user_id) OR EXISTS(SELECT 1 FROM public.orders WHERE user_id=r.user_id) OR EXISTS(SELECT 1 FROM public.payments WHERE user_id=r.user_id OR recorded_by=r.user_id) THEN
 UPDATE public.account_deletion_requests SET processing_state='blocked',failure_code='retention_review_required' WHERE id=r.id;
 RETURN jsonb_build_object('state','blocked');
 END IF;
 ticket:=gen_random_uuid();
 UPDATE public.account_deletion_requests SET processing_state='processing',processing_token=ticket,failure_code=NULL WHERE id=r.id;
 RETURN jsonb_build_object('state','processing','token',ticket,'user_id',r.user_id,'scope',r.scope);
END; $$;
REVOKE ALL ON FUNCTION public.claim_account_deletion(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.claim_account_deletion(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.purge_eligible_account_data(_request uuid,_token uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.account_deletion_requests%ROWTYPE;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Service required'; END IF;
 SELECT * INTO STRICT r FROM public.account_deletion_requests WHERE id=_request AND processing_token=_token AND processing_state='processing' FOR UPDATE;
 IF EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=r.user_id AND role<>'patient') OR EXISTS(SELECT 1 FROM public.appointments WHERE patient_id=r.user_id) OR EXISTS(SELECT 1 FROM public.case_records WHERE patient_id=r.user_id) OR EXISTS(SELECT 1 FROM public.prescriptions WHERE patient_id=r.user_id OR doctor_id=r.user_id) OR EXISTS(SELECT 1 FROM public.case_clinical_notes WHERE doctor_id=r.user_id) OR EXISTS(SELECT 1 FROM public.orders WHERE user_id=r.user_id) OR EXISTS(SELECT 1 FROM public.payments WHERE user_id=r.user_id OR recorded_by=r.user_id) THEN RAISE EXCEPTION 'Retention review required'; END IF;
 DELETE FROM public.health_consent_receipts WHERE user_id=r.user_id;
 DELETE FROM public.checkout_requests WHERE user_id=r.user_id;
 DELETE FROM public.gateway_initiations WHERE user_id=r.user_id;
 DELETE FROM public.clinical_assignments WHERE patient_id=r.user_id OR doctor_id=r.user_id OR assigned_by=r.user_id;
 IF r.scope='account' THEN DELETE FROM public.profiles WHERE id=r.user_id; DELETE FROM public.user_roles WHERE user_id=r.user_id;
 ELSE UPDATE public.profiles SET full_name='',phone=NULL,date_of_birth=NULL,gender=NULL,city=NULL,avatar_url=NULL WHERE id=r.user_id; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.purge_eligible_account_data(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.purge_eligible_account_data(uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.guard_deletion_pending() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE owner_id uuid;
BEGIN
 IF TG_TABLE_NAME IN ('appointments','case_records','prescriptions') THEN owner_id:=NEW.patient_id;
 ELSIF TG_TABLE_NAME='profiles' THEN owner_id:=NEW.id;
 ELSE owner_id:=NEW.user_id; END IF;
 IF auth.role()='service_role' THEN RETURN NEW; END IF;
 IF EXISTS(SELECT 1 FROM public.account_deletion_requests WHERE user_id=owner_id AND processing_state IN ('processing','failed','completed') AND (scope='account' OR processing_state<>'completed')) THEN RAISE EXCEPTION 'Account privacy processing in progress'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_deletion_pending() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER deletion_hold BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.guard_deletion_pending();
CREATE TRIGGER deletion_hold BEFORE INSERT OR UPDATE ON public.case_records FOR EACH ROW EXECUTE FUNCTION public.guard_deletion_pending();
CREATE TRIGGER deletion_hold BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.guard_deletion_pending();
CREATE TRIGGER deletion_hold BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_deletion_pending();
CREATE TRIGGER deletion_hold BEFORE INSERT OR UPDATE ON public.health_consent_receipts FOR EACH ROW EXECUTE FUNCTION public.guard_deletion_pending();
CREATE POLICY report_deletion_hold ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(bucket_id<>'patient-reports' OR NOT EXISTS(SELECT 1 FROM public.account_deletion_requests WHERE user_id=auth.uid() AND processing_state IN ('processing','failed','completed') AND (scope='account' OR processing_state<>'completed')));
COMMENT ON TABLE public.account_deletion_requests IS 'Verified owner intake and token-bound processing. Completed means server checked eligible-data removal; rows with medical/financial/clinician dependencies remain blocked pending lawful retention review. Minimal pseudonymous request audit retained; no invented legal retention period.';