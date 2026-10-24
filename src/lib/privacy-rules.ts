import { z } from "zod";

export const deletionRequestSchema = z.object({
  scope: z.enum(["account", "data"]),
  confirmation: z.literal("DELETE"),
});

export function hasPrivacyConsent(accepted: boolean): boolean {
  return accepted === true;
}
