-- Recovered pre-Drizzle clinical baseline v1, based on hosted schema readback 2026-10-25.
-- Isolated replay only: no production migration journal is changed by this file.
CREATE TABLE public.case_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 patient_id uuid NOT NULL,
 appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
 status text NOT NULL DEFAULT 'draft',
 patient_name text NOT NULL DEFAULT '', age text NOT NULL DEFAULT '', gender text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '',
 chief_complaint text NOT NULL DEFAULT '', complaint_duration text NOT NULL DEFAULT '', current_symptoms text NOT NULL DEFAULT '',
 previous_treatment text NOT NULL DEFAULT '', current_medicines text NOT NULL DEFAULT '', past_medical_history text NOT NULL DEFAULT '',
 surgical_history text NOT NULL DEFAULT '', family_history text NOT NULL DEFAULT '', allergies text NOT NULL DEFAULT '',
 sleep text NOT NULL DEFAULT '', appetite text NOT NULL DEFAULT '', thirst text NOT NULL DEFAULT '', digestion text NOT NULL DEFAULT '',
 occupation text NOT NULL DEFAULT '', lifestyle text NOT NULL DEFAULT '', daily_routine text NOT NULL DEFAULT '',
 emotional_state text NOT NULL DEFAULT '', mental_health_notes text NOT NULL DEFAULT '',
 menstrual_history text NOT NULL DEFAULT '', reproductive_history text NOT NULL DEFAULT '',
 child_birth_history text NOT NULL DEFAULT '', child_vaccination text NOT NULL DEFAULT '', child_development text NOT NULL DEFAULT '', child_behaviour text NOT NULL DEFAULT '',
 attachments jsonb NOT NULL DEFAULT '[]', submitted_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE ON public.case_records TO authenticated;
GRANT ALL ON public.case_records TO service_role;
ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_case ON public.case_records FOR ALL TO authenticated USING(patient_id=auth.uid()) WITH CHECK(patient_id=auth.uid());
CREATE POLICY clinical_case_access ON public.case_records FOR ALL TO authenticated USING(public.has_role(auth.uid(),'doctor') OR public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'doctor') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER case_records_set_updated_at BEFORE UPDATE ON public.case_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.case_clinical_notes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), case_record_id uuid NOT NULL REFERENCES public.case_records(id) ON DELETE CASCADE,
 doctor_id uuid, assessment text NOT NULL DEFAULT '', confidential_notes text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE ON public.case_clinical_notes TO authenticated;
GRANT ALL ON public.case_clinical_notes TO service_role;
ALTER TABLE public.case_clinical_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY clinical_note_access ON public.case_clinical_notes FOR ALL TO authenticated USING(public.has_role(auth.uid(),'doctor') OR public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'doctor') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER case_clinical_notes_set_updated_at BEFORE UPDATE ON public.case_clinical_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.clinical_assignments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), patient_id uuid NOT NULL, doctor_id uuid NOT NULL, assigned_by uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(patient_id,doctor_id)
);
GRANT SELECT,INSERT,DELETE ON public.clinical_assignments TO authenticated;
GRANT ALL ON public.clinical_assignments TO service_role;
ALTER TABLE public.clinical_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ADD COLUMN consultation_type text NOT NULL DEFAULT 'new';

CREATE POLICY report_owner_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='patient-reports' AND ((storage.foldername(name))[1]=auth.uid()::text OR public.has_role(auth.uid(),'doctor') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY report_owner_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='patient-reports' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY report_owner_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='patient-reports' AND (storage.foldername(name))[1]=auth.uid()::text);