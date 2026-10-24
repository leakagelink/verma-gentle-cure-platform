import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  listDeletionRequests,
  listExternalDeletionRequests,
  processAccountDeletion,
} from "@/lib/privacy.functions";

export function DeletionRequests() {
  const list = useServerFn(listDeletionRequests);
  const externalList = useServerFn(listExternalDeletionRequests);
  const process = useServerFn(processAccountDeletion);
  const [external, setExternal] = useState<Awaited<ReturnType<typeof externalList>>>([]);
  const [result, setResult] = useState("");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof list>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <section className="mt-8 space-y-4 border-t border-border pt-6">
      <h2 className="text-xl">Account & data deletion requests</h2>
      <Button
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const [verified, unverified] = await Promise.all([list(), externalList()]);
            setRows(verified);
            setExternal(unverified);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not load requests.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Loading…" : "Load deletion requests"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {result && <p role="status">{result}</p>}
      {rows && (
        <>
          <p className="text-sm text-muted-foreground">
            Only verified-owner requests with no medical, financial or clinician dependencies can be
            processed here. Other requests require documented retention review. Failed or
            interrupted attempts need reconciliation before retrying.
          </p>
          {rows.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((row) => (
                <li key={row.id} className="space-y-1 py-3 text-sm">
                  <p className="font-semibold">
                    {row.scope === "account" ? "Account & data" : "Data only"} ·{" "}
                    {row.processing_state}
                  </p>
                  <p className="break-all">Patient ID: {row.user_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("en-IN")} · {row.id}
                  </p>
                  {row.failure_code && (
                    <p className="text-destructive">
                      {row.failure_code === "retention_review_required"
                        ? "Blocked: medical/financial retention review required"
                        : "Processing failed: manual reconciliation required"}
                    </p>
                  )}
                  <Button
                    variant="destructive"
                    disabled={busy || !["pending", "blocked"].includes(row.processing_state)}
                    onClick={async () => {
                      if (
                        !window.confirm(
                          "Delete eligible data for this verified owner? Accounts with medical or financial records will be blocked. This cannot be undone.",
                        )
                      )
                        return;
                      setBusy(true);
                      setError("");
                      setResult("");
                      try {
                        const outcome = await process({
                          data: { id: row.id, confirmation: "DELETE ELIGIBLE DATA" },
                        });
                        setResult(
                          outcome.state === "completed"
                            ? "Eligible data deletion verified."
                            : outcome.state === "blocked"
                              ? "Blocked for retention review; no deletion performed."
                              : "Deletion failed. Do not report completion; reconcile the affected account.",
                        );
                        setRows(await list());
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Deletion failed.");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Process eligible deletion
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {external.length > 0 && (
        <>
          <h3>External requests — ownership unverified</h3>
          <ul className="divide-y divide-border">
            {external.map((row) => (
              <li className="py-3 text-sm" key={row.id}>
                <p>
                  {row.contact} · {row.scope}
                </p>
                <p className="text-muted-foreground">
                  Verify through the registered contact; obtain the owner's signed-in request or
                  complete documented manual ownership verification. Never delete based on this
                  submission alone.
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
