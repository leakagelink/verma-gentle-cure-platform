ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS consultation_mode public.consultation_mode,
  ADD COLUMN IF NOT EXISTS doctor_name text NOT NULL DEFAULT 'Dr. Rajshree Verma',
  ADD COLUMN IF NOT EXISTS doctor_qualification text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS doctor_registration_no text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS diet_advice text,
  ADD COLUMN IF NOT EXISTS general_care text,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS signature_code text,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS public.prescription_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL,
  actor_id uuid,
  action text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  changed_fields text[] NOT NULL DEFAULT '{}',
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.prescription_audit TO authenticated;
GRANT ALL ON public.prescription_audit TO service_role;

ALTER TABLE public.prescription_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients read own prescription audit"
  ON public.prescription_audit FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Care team reads prescription audit"
  ON public.prescription_audit FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_prescription_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed text[] := '{}';
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.diagnosis IS DISTINCT FROM OLD.diagnosis THEN changed := array_append(changed, 'diagnosis'); END IF;
    IF NEW.advice IS DISTINCT FROM OLD.advice THEN changed := array_append(changed, 'advice'); END IF;
    IF NEW.diet_advice IS DISTINCT FROM OLD.diet_advice THEN changed := array_append(changed, 'diet_advice'); END IF;
    IF NEW.general_care IS DISTINCT FROM OLD.general_care THEN changed := array_append(changed, 'general_care'); END IF;
    IF NEW.medicines IS DISTINCT FROM OLD.medicines THEN changed := array_append(changed, 'medicines'); END IF;
    IF NEW.follow_up_date IS DISTINCT FROM OLD.follow_up_date THEN changed := array_append(changed, 'follow_up_date'); END IF;
    IF array_length(changed, 1) IS NULL THEN
      RETURN NEW;
    END IF;
    NEW.version := OLD.version + 1;
  END IF;

  INSERT INTO public.prescription_audit (prescription_id, patient_id, actor_id, action, version, changed_fields, snapshot)
  VALUES (
    NEW.id,
    NEW.patient_id,
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'issued' ELSE 'edited' END,
    NEW.version,
    changed,
    jsonb_build_object(
      'diagnosis', NEW.diagnosis,
      'advice', NEW.advice,
      'diet_advice', NEW.diet_advice,
      'general_care', NEW.general_care,
      'medicines', NEW.medicines,
      'follow_up_date', NEW.follow_up_date
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prescriptions_audit_insert ON public.prescriptions;
CREATE TRIGGER prescriptions_audit_insert
AFTER INSERT ON public.prescriptions
FOR EACH ROW EXECUTE FUNCTION public.log_prescription_change();

DROP TRIGGER IF EXISTS prescriptions_audit_update ON public.prescriptions;
CREATE TRIGGER prescriptions_audit_update
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW EXECUTE FUNCTION public.log_prescription_change();

CREATE INDEX IF NOT EXISTS prescription_audit_prescription_idx ON public.prescription_audit(prescription_id, created_at DESC);