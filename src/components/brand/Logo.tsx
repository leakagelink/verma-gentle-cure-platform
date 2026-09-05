import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  tone?: "default" | "inverse";
};

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Verma Gentle Cure emblem"
      className={cn("h-9 w-9", className)}
    >
      <circle cx="24" cy="24" r="23" className="fill-navy" />
      <path
        d="M24 38c-6.5-3.6-10-9.2-10-15.2C14 15.3 18.6 10 24 7c5.4 3 10 8.3 10 15.8 0 6-3.5 11.6-10 15.2Z"
        className="fill-forest"
      />
      <path
        d="M24 36.5c-4.8-3.3-7.3-7.9-7.3-13.1 0-6 3.4-10.5 7.3-13.1V36.5Z"
        className="fill-leaf"
      />
      <path d="M24 12v25" className="stroke-lime" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M24 20.5c2.6-1.6 5.2-2.2 8-2.2M24 27c2.4-1.5 4.6-2.1 7-2.2M24 20.5c-2.6-1.6-5.2-2.2-8-2.2M24 27c-2.4-1.5-4.6-2.1-7-2.2"
        className="stroke-lime"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}

export function Logo({ className, showWordmark = true, tone = "default" }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.05rem] font-semibold tracking-tight",
              tone === "inverse" ? "text-navy-foreground" : "text-navy",
            )}
          >
            Verma Gentle Cure
          </span>
          <span
            className={cn(
              "mt-1 text-[0.62rem] font-medium uppercase tracking-[0.22em]",
              tone === "inverse" ? "text-mint" : "text-leaf",
            )}
          >
            Homeopathic Care
          </span>
        </span>
      )}
    </span>
  );
}
