import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { getRequest } from "@tanstack/react-start/server";

// Signed JWTs may survive credential deletion until expiry. Revalidate identity
// and the durable deletion hold before any bearer-authenticated server call.
const activeIdentity = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const header = getRequest().headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const identity = await supabaseAdmin.auth.getUser(header.slice(7));
    if (identity.error || !identity.data.user)
      throw new Error("Sign-in expired. Please sign in again.");
    // Completed data-only requests retain the account.
    const blocked = await supabaseAdmin
      .from("account_deletion_requests")
      .select("scope,processing_state")
      .eq("user_id", identity.data.user.id)
      .in("processing_state", ["processing", "failed", "completed"]);
    if (
      blocked.error ||
      blocked.data?.some((row) => row.scope === "account" || row.processing_state !== "completed")
    )
      throw new Error("Account privacy processing is in progress. Contact the clinic.");
  }
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error("Request failed");
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth, activeIdentity],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
