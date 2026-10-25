import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "patient" | "doctor" | "admin";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isCareTeam: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  role: null,
  isCareTeam: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleUser, setRoleUser] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    let active = true;
    setRole(null);
    setRoleUser(null);
    if (!userId) {
      setRole(null);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!active) return;
        setRoleUser(userId);
        const roles = (data ?? []).map((row) => row.role as AppRole);
        setRole(
          roles.includes("admin")
            ? "admin"
            : roles.includes("doctor")
              ? "doctor"
              : roles.includes("patient")
                ? "patient"
                : null,
        );
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role: roleUser === userId ? role : null,
      isCareTeam: roleUser === userId && (role === "doctor" || role === "admin"),
      loading: loading || Boolean(userId && roleUser !== userId),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, role, loading, roleUser, userId],
  );

  return (
    <AuthContext.Provider value={value}>
      <div key={userId ?? "signed-out"} className="contents">
        {children}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
