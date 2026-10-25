ALTER TABLE public.appointments ADD COLUMN health_consent_at timestamptz, ADD COLUMN health_notice_version text;
ALTER TABLE public.case_records ADD COLUMN health_consent_at timestamptz, ADD COLUMN health_notice_version text;
CREATE OR REPLACE FUNCTION public.require_health_consent() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF auth.role()='service_role' OR public.can_access_patient(NEW.patient_id) THEN RETURN NEW; END IF;
 IF NEW.health_notice_version IS DISTINCT FROM 'health-2026-10-24' OR NEW.health_consent_at IS NULL OR NEW.health_consent_at < now()-interval '1 hour' OR NEW.health_consent_at>now()+interval '1 minute' THEN RAISE EXCEPTION 'Current health consent required'; END IF;
 NEW.health_consent_at:=now(); RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.require_health_consent() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER appointment_consent BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.require_health_consent();
CREATE TRIGGER case_consent BEFORE INSERT OR UPDATE ON public.case_records FOR EACH ROW EXECUTE FUNCTION public.require_health_consent();
CREATE OR REPLACE FUNCTION public.guard_order_update() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF auth.role()='service_role' THEN RETURN NEW; END IF;
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator required'; END IF;
 IF (to_jsonb(NEW)-'status'-'tracking_note'-'updated_at'-'payment_status') IS DISTINCT FROM (to_jsonb(OLD)-'status'-'tracking_note'-'updated_at'-'payment_status') THEN RAISE EXCEPTION 'Protected order fields'; END IF;
 IF NEW.payment_status IS DISTINCT FROM OLD.payment_status AND OLD.payment_method<>'cod' THEN RAISE EXCEPTION 'Online settlement is server-only'; END IF;
 IF NEW.status IS DISTINCT FROM OLD.status AND NOT ((OLD.status='placed' AND NEW.status IN ('confirmed','cancelled')) OR (OLD.status='confirmed' AND NEW.status IN ('packed','cancelled')) OR (OLD.status='packed' AND NEW.status IN ('shipped','cancelled')) OR (OLD.status='shipped' AND NEW.status='delivered')) THEN RAISE EXCEPTION 'Invalid delivery transition'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_order_update() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER order_security BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.guard_order_update();
CREATE POLICY report_upload_type_scope ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (bucket_id<>'patient-reports' OR (lower(metadata->>'mimetype') IN ('application/pdf','image/jpeg','image/png','image/webp') AND (metadata->>'size')::bigint BETWEEN 1 AND 10485760));
CREATE POLICY admin_patient_profile_read ON public.profiles FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.assign_clinical_patient(_patient uuid,_doctor uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator required'; END IF;
 IF NOT public.has_role(_doctor,'doctor') OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_patient) THEN RAISE EXCEPTION 'Invalid patient or doctor'; END IF;
 INSERT INTO public.clinical_assignments(patient_id,doctor_id,assigned_by) VALUES(_patient,_doctor,auth.uid()) ON CONFLICT(patient_id,doctor_id) DO NOTHING;
END; $$;
REVOKE ALL ON FUNCTION public.assign_clinical_patient(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.assign_clinical_patient(uuid,uuid) TO authenticated;
GRANT USAGE ON SEQUENCE public.receipt_seq TO authenticated,service_role;