import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="container-page flex h-15 items-center justify-between gap-3 lg:h-20">
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
            <Link to={user ? "/account" : "/auth"} aria-label="Login or account">
              <UserRound className="size-5" />
            </Link>
          </Button>
          <Button asChild className="hidden rounded-full lg:inline-flex">
            <Link to="/book-appointment">Book Consultation</Link>
          </Button>
          <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="More">
                <Menu className="size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[82dvh] rounded-t-3xl pb-[env(safe-area-inset-bottom)] lg:hidden">
              <DrawerHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center text-left">
                <div className="min-w-0">
                  <DrawerTitle className="font-display text-xl text-navy">Explore</DrawerTitle>
                  <DrawerDescription>More from Verma Gentle Cure</DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 rounded-full" aria-label="Close menu">
                    <X className="size-5" />
                  </Button>
                </DrawerClose>
              </DrawerHeader>
              <nav className="grid grid-cols-2 gap-2 overflow-y-auto px-4 pb-4" aria-label="More navigation">
                {NAV.filter((item) => item.to !== "/").map((item) => (
                  <DrawerClose asChild key={item.to}>
                    <Link
                      to={item.to}
                      className="flex min-h-12 items-center rounded-xl border border-border px-4 text-sm font-medium text-foreground active:bg-mint/60"
                    >
                      {item.label}
                    </Link>
                  </DrawerClose>
                ))}
                <DrawerClose asChild>
                  <Link
                    to={user ? "/account" : "/auth"}
                    className="col-span-2 flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                  >
                    {user ? "My account" : "Login / Register"}
                  </Link>
                </DrawerClose>
              </nav>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
