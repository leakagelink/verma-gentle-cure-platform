import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about-doctor", label: "About Doctor" },
  { to: "/consultation", label: "Consultation" },
  { to: "/treatments", label: "Treatments" },
  { to: "/medicines", label: "Medicines" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link to="/" className="shrink-0" aria-label="Verma Gentle Cure home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-mint/60 hover:text-navy"
              activeProps={{ className: "bg-mint text-navy" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" className="relative rounded-full">
            <Link to="/cart" aria-label={`Shopping cart, ${count} items`}>
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-leaf px-1 text-[0.62rem] font-bold text-leaf-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="hidden rounded-full sm:inline-flex">
            <Link to="/auth" aria-label="Login or account">
              <UserRound className="size-5" />
            </Link>
          </Button>
          <Button asChild className="hidden rounded-full lg:inline-flex">
            <Link to="/book-appointment">Book Consultation</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/70 bg-background transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-mint/60"
              activeProps={{ className: "bg-mint text-navy" }}
            >
              {item.label}
            </Link>
          ))}
          <Button asChild className="mt-2 h-12 rounded-xl text-base">
            <Link to="/book-appointment" onClick={() => setOpen(false)}>
              Book Consultation
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-xl text-base">
            <Link to="/auth" onClick={() => setOpen(false)}>
              Login / Register
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
