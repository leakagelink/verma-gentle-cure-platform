import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";

/** Disposable PostgreSQL only. Never point this bootstrap at the hosted project. */
export async function replayDatabase(includeRecoveredBaseline = true) {
  const db = new PGlite();
  try {
    await db.exec(readFileSync("src/lib/__tests__/platform-shim.sql", "utf8"));
    for (const path of readdirSync("supabase/migrations").sort())
      await db.exec(readFileSync(`supabase/migrations/${path}`, "utf8"));
    if (includeRecoveredBaseline)
      await db.exec(readFileSync("src/lib/__tests__/clinical-baseline.sql", "utf8"));
    const applied: string[] = [];
    for (const path of readdirSync("drizzle/migrations")
      .filter((p) => p.endsWith(".sql"))
      .sort()) {
      if (includeRecoveredBaseline && path.startsWith("0006_")) {
        // Recovered functions require payment row types created by 0001 and 0002.
        await db.exec(readFileSync("src/lib/__tests__/verified-baseline.sql", "utf8"));
        await db.exec(
          "CREATE TRIGGER case_security BEFORE INSERT OR UPDATE ON public.case_records FOR EACH ROW EXECUTE FUNCTION public.guard_case_write(); CREATE TRIGGER payment_security BEFORE INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.guard_payment_write();",
        );
      }
      await db.exec(readFileSync(`drizzle/migrations/${path}`, "utf8"));
      applied.push(path);
    }
    return { db, applied };
  } catch (error) {
    await db.close();
    throw error;
  }
}
