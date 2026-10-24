import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { deletionRequestSchema } from "./privacy-rules";

export const requestAccountDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deletionRequestSchema.parse(input))
  .handler(async ({ data, context }) => {
    // Identity comes only from the verified caller, never from input.
    const { data: existing, error: readError } = await context.supabase
      .from("account_deletion_requests").select("id, status, created_at")
      .eq("user_id", context.userId).eq("scope", data.scope).maybeSingle();
    if (readError) throw new Error("Could not check your request. Please try again.");
    if (existing) return existing;
    const { data: request, error } = await context.supabase
      .from("account_deletion_requests")
      .insert({ user_id: context.userId, scope: data.scope })
      .select("id, status, created_at").single();
    if (error || !request) throw new Error("Could not save your request. Please try again.");
    return request;
  });

export const listDeletionRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !admin) throw new Error("Administrator access required.");
    const { data, error } = await context.supabase.from("account_deletion_requests")
      .select("id, user_id, scope, status, created_at").order("created_at", { ascending: true });
    if (error) throw new Error("Could not load deletion requests.");
    return data ?? [];
  });