import { supabaseAdmin as admin } from "@/integrations/supabase/client.server";
import { executeDeletion } from "./deletion-processor";
import { hasClearedMetadata, isRemovedIdentity, validateStoragePage } from "./deletion-verification";

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
      const entries = validateStoragePage(page.data);
      for (const item of entries) {
        const path = `${prefix}/${item.name}`;
        if (item.id) result.push(path);
        else result.push(...(await files(path)));
      }
      if (entries.length < 100) break;
    }
    return result;
  }
  async function transition(state: "completed" | "failed") {
    const result = await admin.rpc("finish_deletion_generation", {
      _request: id, _token: token, _state: state,
    });
    if (result.error || !result.data) {
      const receipt = await admin.from("account_deletion_requests")
        .select("processing_state").eq("id", id).eq("processing_token", token).single();
      checked(receipt.error);
      if (state === "completed" && receipt.data?.processing_state === "completed") return;
      throw new Error("Deletion receipt unavailable");
    }
    if (result.data !== state) throw new Error("Deletion receipt requires reconciliation");
  }
  return executeDeletion(
    { userId, scope },
    {
      freeze: async () => {
        const identity = await admin.auth.admin.getUserById(userId);
        if (scope === "account" && isRemovedIdentity(identity)) return;
        checked(identity.error);
        if (!identity.data.user) throw new Error("Identity unavailable");
        // Do not remove an existing administrator-imposed ban on data-only restoration.
        if (scope === "data" && identity.data.user.banned_until &&
          Date.parse(identity.data.user.banned_until) > Date.now())
          throw new Error("Restricted identity requires reconciliation");
        const result = await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
        checked(result.error);
        const frozen = await admin.auth.admin.getUserById(userId);
        checked(frozen.error);
        if (!frozen.data.user?.banned_until || Date.parse(frozen.data.user.banned_until) <= Date.now())
          throw new Error("Identity freeze unverified");
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
        const identity = await admin.auth.admin.getUserById(userId);
        if (isRemovedIdentity(identity)) return;
        checked(identity.error);
        const removed = await admin.auth.admin.deleteUser(userId);
        if (removed.error && !isRemovedIdentity(await admin.auth.admin.getUserById(userId)))
          throw new Error("Identity removal failed");
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
        if (scope === "data" && (!profile.data || profile.data.full_name !== "" ||
          [profile.data.phone, profile.data.date_of_birth, profile.data.gender, profile.data.city, profile.data.avatar_url]
            .some((value) => value !== null))) throw new Error("Profile data remains");
        if ((await files(userId)).length) throw new Error("Files remain");
        if (scope === "account") {
          const identity = await admin.auth.admin.getUserById(userId);
          if (!isRemovedIdentity(identity))
            throw new Error("Identity removal unverified");
        } else {
          const identity = await admin.auth.admin.getUserById(userId);
          checked(identity.error);
          if (
            !identity.data.user ||
            !hasClearedMetadata(identity.data.user.user_metadata)
          )
            throw new Error("Personal identity metadata remains");
        }
      },
      restore: async () => {
        checked((await admin.auth.admin.updateUserById(userId, { ban_duration: "none" })).error);
        const identity = await admin.auth.admin.getUserById(userId);
        checked(identity.error);
        if (!identity.data.user || (identity.data.user.banned_until &&
          Date.parse(identity.data.user.banned_until) > Date.now())) throw new Error("Identity restore unverified");
      },
      finish: () => transition("completed"),
      fail: () => transition("failed"),
    },
  );
}
