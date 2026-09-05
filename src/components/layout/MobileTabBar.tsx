import { Link } from "@tanstack/react-router";
import { CalendarDays, Home, Pill, Stethoscope, UserRound } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/consultation", label: "Consult", icon: Stethoscope, exact: false },
  { to: "/medicines", label: "Shop", icon: Pill, exact: false },
  { to: "/book-appointment", label: "Appointments", icon: CalendarDays, exact: false },
  { to: "/auth", label: "Account", icon: UserRound, exact: false },
] as const;

export function MobileTabBar() {
  return (
    <nav
      aria-label="App navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ to, label, icon: Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[0.65rem] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "text-navy" }}
            >
              <Icon className="size-5" />
              <span className="truncate">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
