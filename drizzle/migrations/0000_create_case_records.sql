CREATE TABLE public.case_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  patient_name TEXT NOT NULL DEFAULT '',
  age TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  chief_complaint TEXT NOT NULL DEFAULT '',
  complaint_duration TEXT NOT NULL DEFAULT '',
  current_symptoms TEXT NOT NULL DEFAULT '',
  previous_treatment TEXT NOT NULL DEFAULT '',
  current_medicines TEXT NOT NULL DEFAULT '',
  past_medical_history TEXT NOT NULL DEFAULT '',
  surgical_history TEXT NOT NULL DEFAULT '',
  family_history TEXT NOT NULL DEFAULT '',
  allergies TEXT NOT NULL DEFAULT '',
  sleep TEXT NOT NULL DEFAULT '',
  appetite TEXT NOT NULL DEFAULT '',
  thirst TEXT NOT NULL DEFAULT '',
  digestion TEXT NOT NULL DEFAULT '',
  occupation TEXT NOT NULL DEFAULT '',
  lifestyle TEXT NOT NULL DEFAULT '',
  daily_routine TEXT NOT NULL DEFAULT '',
  emotional_state TEXT NOT NULL DEFAULT '',
  mental_health_notes TEXT NOT NULL DEFAULT '',
  menstrual_history TEXT NOT NULL DEFAULT '',
  reproductive_history TEXT NOT NULL DEFAULT '',
  child_birth_history TEXT NOT NULL DEFAULT '',
  child_vaccination TEXT NOT NULL DEFAULT '',
  child_development TEXT NOT NULL DEFAULT '',
  child_behaviour TEXT NOT NULL DEFAULT '',
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.case_records TO authenticated;
GRANT ALL ON public.case_records TO service_role;

ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own case records" ON public.case_records
  FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Patients create own case records" ON public.case_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients update own draft case records" ON public.case_records
  FOR UPDATE TO authenticated USING (auth.uid() = patient_id AND status = 'draft')
  WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Care team view all case records" ON public.case_records
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Care team update case records" ON public.case_records
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER case_records_set_updated_at BEFORE UPDATE ON public.case_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_case_records_patient ON public.case_records(patient_id);

-- Confidential clinical notes: care team only, never readable by patients
CREATE TABLE public.case_clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_record_id UUID NOT NULL REFERENCES public.case_records(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assessment TEXT NOT NULL DEFAULT '',
  confidential_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.case_clinical_notes TO authenticated;
GRANT ALL ON public.case_clinical_notes TO service_role;

ALTER TABLE public.case_clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Care team view clinical notes" ON public.case_clinical_notes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Care team create clinical notes" ON public.case_clinical_notes
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Care team update clinical notes" ON public.case_clinical_notes
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER case_clinical_notes_set_updated_at BEFORE UPDATE ON public.case_clinical_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_case_clinical_notes_case ON public.case_clinical_notes(case_record_id);