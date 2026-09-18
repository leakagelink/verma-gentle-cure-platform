CREATE SEQUENCE IF NOT EXISTS public.receipt_seq START 1001;

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no text NOT NULL UNIQUE DEFAULT ('VGC-RCP-' || to_char(now(), 'YYMM') || '-' || lpad(nextval('public.receipt_seq')::text, 5, '0')),
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'consultation',
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  payer_name text NOT NULL DEFAULT '',
  amount integer NOT NULL,
  method text NOT NULL DEFAULT 'cash',
  status public.payment_status NOT NULL DEFAULT 'pending',
  gateway text,
  gateway_payment_id text,
  failure_reason text,
  attempt integer NOT NULL DEFAULT 1,
  refund_amount integer NOT NULL DEFAULT 0,
  refund_status text NOT NULL DEFAULT 'none',
  refund_note text,
  notes text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients read own payments"
  ON public.payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Care team reads payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Patients record own payment attempts"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND recorded_by IS NULL);

CREATE POLICY "Care team records payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Care team updates payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS payments_set_updated_at ON public.payments;
CREATE TRIGGER payments_set_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS payments_user_idx ON public.payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status, created_at DESC);