import { describe, expect, it } from "vitest";
import { executeDeletion, type DeletionOperations } from "./deletion-processor";

function operations(failedStep?: string) {
  const calls: string[] = [];
  const ops = Object.fromEntries(["freeze", "removeFiles", "purge", "removeIdentity", "verify", "finish", "restore", "fail"].map(name => [name, async () => {
    calls.push(name);
    if (name === failedStep) throw new Error("synthetic failure");
  }])) as DeletionOperations;
  return { ops, calls };
}
describe("eligible deletion orchestration", () => {
  it("removes credentials only for account scope and completes after verification", async () => {
    const { ops, calls } = operations();
    expect(await executeDeletion({ userId: "synthetic", scope: "account" }, ops)).toEqual({ state: "completed" });
    expect(calls).toEqual(["freeze", "removeFiles", "purge", "removeIdentity", "verify", "finish"]);
  });
  it("data-only deletion keeps credentials and restores sign-in after verified removal", async () => {
    const { ops, calls } = operations();
    await executeDeletion({ userId: "synthetic", scope: "data" }, ops);
    expect(calls).toEqual(["freeze", "removeFiles", "purge", "verify", "restore", "finish"]);
  });
  for (const step of ["freeze", "removeFiles", "purge", "removeIdentity", "verify", "finish"]) {
    it(`never reports partial ${step} failure as completed`, async () => {
      const { ops, calls } = operations(step);
      expect(await executeDeletion({ userId: "synthetic", scope: "account" }, ops)).toEqual({ state: "failed" });
      expect(calls.at(-1)).toBe("fail");
      if (step !== "finish") expect(calls).not.toContain("finish");
    });
  }
});