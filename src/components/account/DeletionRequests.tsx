import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { listDeletionRequests } from "@/lib/privacy.functions";

export function DeletionRequests() {
  const list = useServerFn(listDeletionRequests);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof list>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <section className="mt-8 space-y-4 border-t border-border pt-6">
    <h2 className="text-xl">Account & data deletion requests</h2>
    <Button variant="outline" disabled={busy} onClick={async () => {
      setBusy(true); setError("");
      try { setRows(await list()); } catch (err) { setError(err instanceof Error ? err.message : "Could not load requests."); }
      finally { setBusy(false); }
    }}>{busy ? "Loading…" : "Load deletion requests"}</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {rows && <><p className="text-sm text-muted-foreground">Verify ownership, review any legally required retention, delete eligible account data and files, then confirm the outcome with the patient. This queue does not perform deletion.</p>
      {rows.length === 0 ? <p>No pending requests.</p> : <ul className="divide-y divide-border">{rows.map(row => <li key={row.id} className="space-y-1 py-3 text-sm">
        <p className="font-semibold">{row.scope === "account" ? "Account & data" : "Data only"} · {row.status}</p>
        <p className="break-all">Patient ID: {row.user_id}</p>
        <p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString("en-IN")} · {row.id}</p>
      </li>)}</ul>}</>}
  </section>;
}