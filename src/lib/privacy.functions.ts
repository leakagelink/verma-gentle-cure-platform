import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { deletionRequestSchema } from "./privacy-rules";
import { z } from "zod";

export const requestAccountDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deletionRequestSchema.parse(input))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("submit_deletion_request", {
      _scope: data.scope, _submission: data.submissionId,
    });
    if (result.error) throw new Error("Could not save your request. Please try again.");
    return z.object({ id: z.string().uuid(), status: z.string(), processing_state: z.string(), created_at: z.string() }).parse(result.data);
  });

export const listDeletionRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !admin) throw new Error("Administrator access required.");
    const { data, error } = await context.supabase
      .from("account_deletion_requests")
      .select("id, user_id, scope, status, created_at, processing_state, failure_code")
      .order("created_at", { ascending: true });
    if (error) throw new Error("Could not load deletion requests.");
    return data ?? [];
  });

export const submitExternalDeletion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        contact: z
          .string()
          .trim()
          .min(5)
          .max(254)
          .refine(
            (value) =>
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^\+?[0-9 ()-]{10,20}$/.test(value),
          ),
        scope: z.enum(["account", "data"]),
        confirmation: z.literal("DELETE"),
        website: z.literal(""),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Deduplicate the same contact/scope per day, not unrelated shared-IP users.
    // Deployment-level rate limiting remains separate; never discard distinct requests.
    const bytes = new TextEncoder().encode(
      `${data.contact.toLowerCase()}:${data.scope}:${new Date().toISOString().slice(0, 10)}`,
    );
    const rateKey = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      (byte) => byte.toString(16).padStart(2, "0"),
    ).join("");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin
      .from("external_deletion_requests")
      .insert({ contact: data.contact, scope: data.scope, rate_key: rateKey });
    if (result.error && result.error.code !== "23505")
      throw new Error("Could not receive your request. Please contact the clinic.");
    // Never reveal whether this contact is registered or expose an existing request.
    return { received: true };
  });

export const processAccountDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid(), confirmation: z.literal("DELETE ELIGIBLE DATA") })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const claim = await context.supabase.rpc("claim_account_deletion", { _request: data.id });
    if (claim.error)
      throw new Error("Unable to claim deletion. Reconcile any previous attempt before retrying.");
    const parsed = z
      .object({
        state: z.string(),
        token: z.string().uuid().optional(),
        user_id: z.string().uuid().optional(),
        scope: z.enum(["account", "data"]).optional(),
      })
      .parse(claim.data);
    if (parsed.state !== "processing") return { state: parsed.state };
    if (!parsed.token || !parsed.user_id || !parsed.scope)
      throw new Error("Invalid processing claim");
    const { processEligibleDeletion } = await import("./deletion.server");
    return processEligibleDeletion(data.id, parsed.token, parsed.user_id, parsed.scope);
  });

export const listExternalDeletionRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const result = await context.supabase
      .from("external_deletion_requests")
      .select("id,contact,scope,state,created_at")
      .eq("state", "unverified")
      .order("created_at");
    if (result.error) throw new Error("Could not load external requests");
    return result.data ?? [];
  });
