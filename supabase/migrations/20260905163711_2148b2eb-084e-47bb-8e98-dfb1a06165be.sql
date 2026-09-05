CREATE TYPE public.consultation_mode AS ENUM ('clinic', 'video', 'audio');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  gender TEXT,
  mode public.consultation_mode NOT NULL DEFAULT 'clinic',
  appointment_date DATE NOT NULL,
  slot TEXT NOT NULL,
  concern TEXT NOT NULL,
  medical_history TEXT,
  current_medication TEXT,
  allergies TEXT,
  fee INTEGER NOT NULL DEFAULT 0,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  doctor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can book their own appointments"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their pending appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (auth.uid() = patient_id AND status IN ('pending', 'confirmed'))
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Care team can view all appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Care team can update all appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER appointments_set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX appointments_patient_idx ON public.appointments (patient_id, appointment_date DESC);
CREATE INDEX appointments_date_idx ON public.appointments (appointment_date DESC);

CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_no TEXT NOT NULL UNIQUE DEFAULT ('VGC-RX-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  diagnosis TEXT NOT NULL DEFAULT '',
  advice TEXT,
  medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own prescriptions"
  ON public.prescriptions FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Care team can view all prescriptions"
  ON public.prescriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Care team can create prescriptions"
  ON public.prescriptions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Care team can update prescriptions"
  ON public.prescriptions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER prescriptions_set_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX prescriptions_patient_idx ON public.prescriptions (patient_id, created_at DESC);