CREATE TABLE public.account_deletion_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 scope text NOT NULL CHECK (scope IN ('account','data')),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_review')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.account_deletion_requests TO authenticated;
GRANT UPDATE ON public.account_deletion_requests TO authenticated;
GRANT ALL ON public.account_deletion_requests TO service_role;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY deletion_request_owner_read ON public.account_deletion_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY deletion_request_owner_insert ON public.account_deletion_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY deletion_request_admin_read ON public.account_deletion_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY deletion_request_admin_update ON public.account_deletion_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE UNIQUE INDEX deletion_request_one_per_scope ON public.account_deletion_requests(user_id, scope);
COMMENT ON TABLE public.account_deletion_requests IS 'Verified owner requests for account/data deletion. Admin review only; status must not imply deletion has executed.';