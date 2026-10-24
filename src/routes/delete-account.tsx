import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/ui-kit/PageHero";
import { useAuth } from "@/hooks/useAuth";
import { requestAccountDeletion } from "@/lib/privacy.functions";
import { CLINIC } from "@/lib/site-data";

export const Route = createFileRoute("/delete-account")({
  head: () => ({ meta: [
    { title: "Account & Data Deletion | Verma Gentle Cure" },
    { name: "description", content: "Request deletion of your Verma Gentle Cure account or personal data, online or through the clinic." },
    { property: "og:title", content: "Account & Data Deletion | Verma Gentle Cure" },
    { property: "og:description", content: "Account and personal data deletion requests for Verma Gentle Cure patients." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  const { user, loading } = useAuth();
  const requestDeletion = useServerFn(requestAccountDeletion);
  const [scope, setScope] = useState<"account" | "data">("account");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [request, setRequest] = useState<{ id: string; status: string } | null>(null);
  const [error, setError] = useState("");
  return <>
    <PageHero eyebrow="Privacy" title="Account & data deletion" description="Request deletion of your Verma Gentle Cure account or personal data." />
    <section className="container-page max-w-3xl space-y-6 py-8 pr-16 lg:pr-4">
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-xl text-foreground">What happens to your information</h2>
        <p>Account deletion removes your sign-in account and non-required profile information. Data-only deletion lets you request removal of non-required personal information without closing your account. The clinic verifies account ownership before acting.</p>
        <p>Medical records, prescriptions, billing, tax, refund or dispute records may need to be retained where applicable law or an unresolved transaction requires it. The clinic will explain any retained categories, legal reason and applicable retention period when reviewing your request. Retained records remain access-controlled.</p>
        <p>This is a deletion request, not instant deletion. The clinic processes it manually and confirms the outcome; signing out or uninstalling the app does not delete your account.</p>
      </div>
      {loading ? <p>Checking your account…</p> : user ? request ?
        <div role="status" className="rounded-lg border border-border bg-mint p-5">
          <h2 className="text-lg">Deletion request received</h2>
          <p className="mt-2 text-sm">Status: {request.status === "in_review" ? "Under review" : "Pending clinic review"}. Your account has not been deleted yet.</p>
          <p className="mt-2 break-all text-xs text-muted-foreground">Reference: {request.id}</p>
        </div> : <form className="space-y-4" onSubmit={async e => {
          e.preventDefault(); if (busy) return; setBusy(true); setError("");
          try { setRequest(await requestDeletion({ data: { scope, confirmation } })); }
          catch (err) { setError(err instanceof Error ? err.message : "Could not submit your request."); }
          finally { setBusy(false); }
        }}>
          <fieldset className="space-y-2">
            <legend className="mb-2 font-semibold">Request type</legend>
            <Label className="flex items-center gap-3"><input type="radio" name="scope" checked={scope === "account"} onChange={() => setScope("account")} /> Delete account & associated data</Label>
            <Label className="flex items-center gap-3"><input type="radio" name="scope" checked={scope === "data"} onChange={() => setScope("data")} /> Delete personal data only</Label>
          </fieldset>
          <Label htmlFor="delete-confirmation">Type DELETE to confirm your request</Label>
          <Input id="delete-confirmation" value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="off" required />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="destructive" disabled={busy || confirmation !== "DELETE"}><Trash2 className="size-4" /> {busy ? "Submitting…" : "Request deletion"}</Button>
        </form> : <div className="space-y-3">
          <Button asChild><Link to="/auth">Sign in to submit a verified request</Link></Button>
          <p className="text-sm text-muted-foreground">You can also request deletion without signing in or reinstalling the app: call the clinic or send “Account/data deletion request” on WhatsApp, with your registered email or phone number. Never send your password, OTP or medical reports. The clinic verifies ownership before deleting anything.</p>
        </div>}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline"><a href={CLINIC.phoneHref}>Call {CLINIC.phone}</a></Button>
        <Button asChild variant="outline"><a href={`${CLINIC.whatsappHref}?text=${encodeURIComponent("I would like to request deletion of my Verma Gentle Cure account or personal data.")}`} target="_blank" rel="noopener noreferrer">WhatsApp {CLINIC.whatsapp}</a></Button>
        <Button asChild variant="ghost"><Link to="/privacy-policy">Privacy policy</Link></Button>
      </div>
    </section>
  </>;
}