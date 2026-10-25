import { describe, expect, it } from "vitest";
import { hasClearedMetadata, isRemovedIdentity, validateStoragePage } from "./deletion-verification";

describe("deletion evidence validation", () => {
  it("accepts only structured user-not-found evidence", () => {
    expect(isRemovedIdentity({ data: { user: null }, error: { code: "user_not_found" } })).toBe(true);
    expect(isRemovedIdentity({ data: { user: null }, error: { code: "unexpected_failure" } })).toBe(false);
    expect(isRemovedIdentity({ data: { user: { id: "exists" } }, error: null })).toBe(false);
    expect(isRemovedIdentity({ data: { user: null }, error: null })).toBe(false);
  });
  it("rejects missing storage readback instead of treating it as empty", () => {
    expect(() => validateStoragePage(null)).toThrow();
    expect(validateStoragePage([])).toEqual([]);
  });
  it("rejects malformed or traversing storage entries", () => {
    for (const name of ["..", ".", "../other", "folder/file", "folder\\file", ""]) {
      expect(() => validateStoragePage([{ name, id: null }])).toThrow();
    }
    expect(() => validateStoragePage([{ name: "file", id: undefined }])).toThrow();
    expect(validateStoragePage([{ name: "folder", id: null }, { name: "report.pdf", id: "uuid" }])).toHaveLength(2);
  });
  it("does not mistake false or zero personal metadata for erased values", () => {
    expect(hasClearedMetadata({ full_name: null })).toBe(true);
    expect(hasClearedMetadata({ phone: 0 })).toBe(false);
    expect(hasClearedMetadata({ name: false })).toBe(false);
  });
});