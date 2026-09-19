import { cn } from "@/lib/utils";

/**
 * Nexus logo — symbol: a route from China (dot) arcing to the world (arcs).
 * Represents movement, connection, speed (spec §4).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      {/* origin dot — China */}
      <circle cx="13" cy="35" r="4.5" fill="#146EF5" />
      {/* route arc */}
      <path
        d="M17 30C23 20 30 14 38 10"
        stroke="#3B82F6"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* destination dot — world */}
      <circle cx="38" cy="10" r="4.5" fill="#3B82F6" />
      {/* speed slash */}
      <path d="M24 30L20 35" stroke="#E53935" strokeWidth="2.5" strokeLinecap="round" />
      {/* motion lines */}
      <path d="M28 22L32 19" stroke="#071A2F" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M26 26L30 23" stroke="#071A2F" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

export function Logo({
  className,
  variant = "horizontal",
  tone = "dark",
}: {
  className?: string;
  variant?: "horizontal" | "vertical";
  tone?: "dark" | "light";
}) {
  const nameCls = cn(
    "font-semibold tracking-tight leading-none",
    variant === "horizontal" ? "text-lg" : "text-base",
    tone === "light" ? "text-white" : "text-navy",
  );

  if (variant === "vertical") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <LogoMark className="h-10 w-10" />
        <div className="text-center">
          <div className={nameCls}>NEXUS</div>
          <div className={cn("mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em]", tone === "light" ? "text-blue-200/80" : "text-muted-foreground")}>
            Global Logistics
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9 shrink-0" />
      <div className="flex flex-col">
        <span className={nameCls}>
          NEXUS
          <span className="text-primary"> LOGISTICS</span>
        </span>
        <span
          className={cn(
            "text-[9px] font-medium uppercase tracking-[0.26em]",
            tone === "light" ? "text-blue-200/70" : "text-muted-foreground",
          )}
        >
          China → World
        </span>
      </div>
    </div>
  );
}

/**
 * Favicon / mark-only rendered variant for app icons.
 */
export function LogoFavicon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={cn("h-6 w-6", className)}>
      <circle cx="13" cy="35" r="6" fill="#146EF5" />
      <path d="M17 30C23 20 30 14 40 10" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="10" r="6" fill="#3B82F6" />
    </svg>
  );
}