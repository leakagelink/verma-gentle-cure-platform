import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset Password | Verma Gentle Cure" }, { name: "description", content: "Securely reset your Verma Gentle Cure account password using your recovery email." },
    { property: "og:title", content: "Reset Password | Verma Gentle Cure" }, { property: "og:description", content: "Patient account password recovery." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" },
  ] }), component: ResetPasswordPage,
});
function ResetPasswordPage() {
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const fromRecovery = new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
    const { data } = supabase.auth.onAuthStateChange(event => { if (event === "PASSWORD_RECOVERY") setRecovery(true); });
    if (fromRecovery) void supabase.auth.getUser().then(({ data }) => setRecovery(Boolean(data.user)));
    return () => data.subscription.unsubscribe();
  }, []);
  return <section className="container-page max-w-lg space-y-5 py-12">
    <h1 className="text-2xl">Reset password</h1>
    {recovery ? <form className="space-y-4" onSubmit={async e => {
      e.preventDefault(); if (busy || password.length < 8) return; setBusy(true);
      const { error } = await supabase.auth.updateUser({ password });
      setBusy(false); setMessage(error ? error.message : "Password updated. You can now sign in with your new password.");
      if (!error) { setRecovery(false); await supabase.auth.signOut(); }
    }}><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Update password"}</Button></form> : <p className="text-sm text-muted-foreground">Open the password recovery link from your email to set a new password.</p>}
    {message && <p role="status" className="text-sm">{message}</p>}
    <Button asChild variant="outline"><Link to="/auth">Back to sign in</Link></Button>
  </section>;
}