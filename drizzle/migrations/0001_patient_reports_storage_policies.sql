CREATE POLICY "Patients read own report files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'patient-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Patients upload own report files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'patient-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Patients delete own report files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'patient-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Care team read all report files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'patient-reports' AND (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));