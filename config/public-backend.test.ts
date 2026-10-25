import { describe, expect, it } from "vitest";
import { publicBackendDefines } from "./public-backend";

describe("published public connection configuration", () => {
  it("provides the public connection even without a local environment file", () => {
    const defines = publicBackendDefines({});
    expect(JSON.parse(defines["import.meta.env.VITE_SUPABASE_URL"])).toBe(
      "https://ybtskeajvpnntwoxcung.supabase.co",
    );
    expect(JSON.parse(defines["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"])).toMatch(
      /^sb_publishable_/,
    );
  });

  it("preserves supplied preview connection configuration", () => {
    const defines = publicBackendDefines({
      VITE_SUPABASE_URL: "https://preview.example.test",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    });
    expect(JSON.parse(defines["import.meta.env.VITE_SUPABASE_URL"])).toBe(
      "https://preview.example.test",
    );
    expect(JSON.parse(defines["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"])).toBe(
      "sb_publishable_test",
    );
  });

  it("never passes private server environment variables into browser defines", () => {
    const defines = publicBackendDefines({
      SUPABASE_SERVICE_ROLE_KEY: "private-test-sentinel",
      RAZORPAY_KEY_SECRET: "payment-test-sentinel",
    });
    expect(Object.keys(defines).sort()).toEqual([
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY",
      "import.meta.env.VITE_SUPABASE_URL",
    ]);
    expect(JSON.stringify(defines)).not.toContain("private-test-sentinel");
    expect(JSON.stringify(defines)).not.toContain("payment-test-sentinel");
  });
});
