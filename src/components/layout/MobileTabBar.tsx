import { Link } from "@tanstack/react-router";
import { CalendarDays, Home, Pill, Stethoscope, UserRound } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export function MobileTabBar() {
  const { user } = useAuth();
  const TABS = [
    { to: "/", label: "Home", icon: Home, exact: true },
    { to: "/consultation", label: "Consult", icon: Stethoscope, exact: false },
    { to: "/medicines", label: "Shop", icon: Pill, exact: false },
    { to: "/book-appointment", label: "Appointments", icon: CalendarDays, exact: false },
    { to: user ? "/account" : "/auth", label: "Account", icon: UserRound, exact: false },
  ] as const;
  return (
    <nav
      aria-label="App navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-20px_var(--navy)] backdrop-blur-xl lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ to, label, icon: Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="group flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[0.65rem] font-medium text-muted-foreground transition-colors active:scale-95"
              activeProps={{ className: "text-forest" }}
            >
              <span className="grid h-7 min-w-12 place-items-center rounded-full transition-colors group-data-[status=active]:bg-mint">
                <Icon className="size-5" />
              </span>
              <span className="truncate">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
