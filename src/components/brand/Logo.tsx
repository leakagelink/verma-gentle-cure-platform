import { cn } from "@/lib/utils";
import logoAsset from "@/assets/verma-gentle-cure-logo.webp.asset.json";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  tone?: "default" | "inverse";
};

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="Verma Gentle Cure logo"
      width={72}
      height={56}
      loading="eager"
      decoding="async"
      className={cn("h-10 w-auto object-contain", className)}
    />
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
