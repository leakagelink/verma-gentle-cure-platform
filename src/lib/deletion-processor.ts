export type DeletionJob = { userId: string; scope: "account" | "data" };
export type DeletionOperations = {
  freeze: () => Promise<void>;
  removeFiles: () => Promise<void>;
  purge: () => Promise<void>;
  removeIdentity: () => Promise<void>;
  verify: () => Promise<void>;
  finish: () => Promise<void>;
  restore: () => Promise<void>;
  fail: () => Promise<void>;
};

// A failure at any stage must never produce a completion receipt.
export async function executeDeletion(job: DeletionJob, ops: DeletionOperations) {
  try {
    await ops.freeze();
    await ops.removeFiles();
    await ops.purge();
    if (job.scope === "account") await ops.removeIdentity();
    await ops.verify();
    if (job.scope === "data") await ops.restore();
    await ops.finish();
    return { state: "completed" as const };
  } catch {
    await ops.fail();
    return { state: "failed" as const };
  }
}
