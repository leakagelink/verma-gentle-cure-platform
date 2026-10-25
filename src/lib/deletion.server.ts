import { supabaseAdmin as admin } from "@/integrations/supabase/client.server";
import { executeDeletion } from "./deletion-processor";

export async function processEligibleDeletion(
  id: string,
  token: string,
  userId: string,
  scope: "account" | "data",
) {
  const checked = (error: unknown) => {
    if (error) throw new Error("Deletion stage failed");
  };
  async function files(prefix: string): Promise<string[]> {
    const result: string[] = [];
    for (let offset = 0; ; offset += 100) {
      const page = await admin.storage
        .from("patient-reports")
        .list(prefix, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
      checked(page.error);
      for (const item of page.data ?? []) {
        const path = `${prefix}/${item.name}`;
        if (item.id) result.push(path);
        else result.push(...(await files(path)));
      }
      if ((page.data?.length ?? 0) < 100) break;
    }
    return result;
  }
  async function transition(state: "completed" | "failed") {
    const result = await admin
      .from("account_deletion_requests")
      .update({
        processing_state: state,
        completed_at: state === "completed" ? new Date().toISOString() : null,
        failure_code: state === "failed" ? "processing_failed_requires_reconciliation" : null,
      })
      .eq("id", id)
      .eq("processing_token", token)
      .eq("processing_state", "processing")
      .select("id")
      .single();
    checked(result.error);
    if (!result.data) throw new Error("Deletion receipt unavailable");
  }
  return executeDeletion(
    { userId, scope },
    {
      freeze: async () => {
        const result = await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
        checked(result.error);
        if (scope === "data") {
          checked(
            (
              await admin.auth.admin.updateUserById(userId, {
                user_metadata: {
                  full_name: null,
                  phone: null,
                  name: null,
                  avatar_url: null,
                  picture: null,
                },
              })
            ).error,
          );
        }
      },
      removeFiles: async () => {
        const paths = await files(userId);
        for (let offset = 0; offset < paths.length; offset += 100) {
          const result = await admin.storage
            .from("patient-reports")
            .remove(paths.slice(offset, offset + 100));
          checked(result.error);
        }
        if ((await files(userId)).length) throw new Error("Files remain");
      },
      purge: async () => {
        const result = await admin.rpc("purge_eligible_account_data", {
          _request: id,
          _token: token,
        });
        checked(result.error);
      },
      removeIdentity: async () => {
        checked((await admin.auth.admin.deleteUser(userId)).error);
      },
      verify: async () => {
        for (const table of [
          "health_consent_receipts",
          "checkout_requests",
          "gateway_initiations",
          "user_roles",
        ] as const) {
          if (table === "user_roles" && scope === "data") continue;
          const result = await admin
            .from(table)
            .select("user_id", { count: "exact", head: true })
            .eq("user_id", userId);
          checked(result.error);
          if (result.count !== 0) throw new Error("Personal data remains");
        }
        const profile = await admin
          .from("profiles")
          .select("full_name,phone,date_of_birth,gender,city,avatar_url")
          .eq("id", userId)
          .maybeSingle();
        checked(profile.error);
        if (scope === "account" && profile.data) throw new Error("Profile remains");
        if (scope === "data" && profile.data && Object.values(profile.data).some(Boolean))
          throw new Error("Profile data remains");
        if ((await files(userId)).length) throw new Error("Files remain");
        if (scope === "account") {
          const identity = await admin.auth.admin.getUserById(userId);
          if (identity.data.user || identity.error?.status !== 404)
            throw new Error("Identity removal unverified");
        } else {
          const identity = await admin.auth.admin.getUserById(userId);
          checked(identity.error);
          if (
            !identity.data.user ||
            ["full_name", "phone", "name", "avatar_url", "picture"].some((key) =>
              Boolean(identity.data.user?.user_metadata[key]),
            )
          )
            throw new Error("Personal identity metadata remains");
        }
      },
      restore: async () => {
        checked((await admin.auth.admin.updateUserById(userId, { ban_duration: "none" })).error);
      },
      finish: () => transition("completed"),
      fail: () => transition("failed"),
    },
  );
}
