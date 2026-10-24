import { describe, expect, it } from "vitest";
import { deletionRequestSchema, hasPrivacyConsent } from "./privacy-rules";

describe("privacy safeguards", () => {
  it("requires explicit deletion confirmation", () => {
    expect(deletionRequestSchema.safeParse({ scope: "account", confirmation: "DELETE" }).success).toBe(true);
    expect(deletionRequestSchema.safeParse({ scope: "account", confirmation: "" }).success).toBe(false);
  });
  it("allows account deletion or data deletion only", () => {
    expect(deletionRequestSchema.safeParse({ scope: "data", confirmation: "DELETE" }).success).toBe(true);
    expect(deletionRequestSchema.safeParse({ scope: "other", confirmation: "DELETE" }).success).toBe(false);
  });
  it("requires affirmative consent before health data is saved", () => {
    expect(hasPrivacyConsent(false)).toBe(false);
    expect(hasPrivacyConsent(true)).toBe(true);
  });
});