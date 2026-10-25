// Public connection identifiers only. Access remains controlled by authentication and RLS.
// Never add service keys, payment secrets, or other private configuration here.
const publicDefaults = {
  VITE_SUPABASE_URL: "https://ybtskeajvpnntwoxcung.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_tLLmuYJzRvGXKAhke4J2Aw_lwGpnmZv",
};

export function publicBackendDefines(environment: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(publicDefaults).map(([name, fallback]) => [
      `import.meta.env.${name}`,
      JSON.stringify(environment[name]?.trim() || fallback),
    ]),
  );
}
