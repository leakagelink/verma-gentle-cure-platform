import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
export function ClinicalAssignments() {
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <section className="mt-8 space-y-4 border-t border-border pt-6">
      <h2 className="text-xl">Assign treating doctor</h2>
      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setMessage("");
          try {
            const result = await supabase.rpc("assign_clinical_patient", {
              _patient: patient.trim(),
              _doctor: doctor.trim(),
            });
            if (result.error) throw new Error();
            setMessage("Doctor assigned to this patient.");
          } catch {
            setMessage("Could not assign doctor. Check both IDs and administrator access.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Label htmlFor="assignment-patient">Patient ID</Label>
        <Input
          id="assignment-patient"
          value={patient}
          onChange={(event) => setPatient(event.target.value)}
          required
        />
        <Label htmlFor="assignment-doctor">Doctor account ID</Label>
        <Input
          id="assignment-doctor"
          value={doctor}
          onChange={(event) => setDoctor(event.target.value)}
          required
        />
        <Button disabled={busy} type="submit">
          {busy ? "Saving…" : "Assign doctor"}
        </Button>
        {message && (
          <p role="status" className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
