// Browser-safe validation; provider clients and credentials stay server-only.
export function isRemovedIdentity(result: {
  data: { user: unknown };
  error: { code?: string | undefined } | null;
}) {
  return !result.data.user && result.error?.code === "user_not_found";
}

export function validateStoragePage(data: unknown): { name: string; id: string | null }[] {
  if (!Array.isArray(data)) throw new Error("Storage listing unavailable");
  return data.map((entry: unknown) => {
    if (!entry || typeof entry !== "object") throw new Error("Invalid storage entry");
    const item = entry as Record<string, unknown>;
    if (
      typeof item.name !== "string" ||
      !item.name ||
      item.name === "." ||
      item.name === ".." ||
      /[/\\]/.test(item.name) ||
      !(item.id === null || (typeof item.id === "string" && item.id.length > 0))
    )
      throw new Error("Invalid storage entry");
    return { name: item.name, id: item.id as string | null };
  });
}

export function hasClearedMetadata(metadata: Record<string, unknown>) {
  return ["full_name", "phone", "name", "avatar_url", "picture"].every(
    (key) => metadata[key] === undefined || metadata[key] === null,
  );
}
