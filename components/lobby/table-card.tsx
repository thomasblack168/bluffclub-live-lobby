import type { LobbyTable } from "@/types/lobby";

function variantRing(variant: string) {
  switch (variant) {
    case "online":
      return "border-sky-500/70 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]";
    case "rangsit":
      return "border-amber-600/70 shadow-[0_0_0_1px_rgba(217,119,6,0.12)]";
    default:
      return "border-zinc-500/50 shadow-[0_0_0_1px_rgba(161,161,170,0.12)]";
  }
}

function variantBg(variant: string) {
  switch (variant) {
    case "online":
      return "from-sky-950/90 via-slate-950/40 to-zinc-950";
    case "rangsit":
      return "from-amber-950/80 via-zinc-950/50 to-zinc-950";
    default:
      return "from-zinc-800/70 via-zinc-950/60 to-zinc-950";
  }
}

function logoLabel(table: LobbyTable) {
  if (table.logoKey?.trim()) return table.logoKey.trim();
  return table.title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function TableCard({ table }: { table: LobbyTable }) {
  const v = table.location.variant;
  return (
    <article
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-r ${variantBg(v)} ${variantRing(
        v,
      )}`}
    >
      <div className="flex items-stretch gap-3 p-3 sm:p-4">
        <div className="flex shrink-0 items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/30 text-[10px] font-bold uppercase leading-tight text-center text-zinc-100 sm:h-16 sm:w-16 sm:text-xs">
            {logoLabel(table)}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="truncate text-sm font-black uppercase tracking-tight text-white sm:text-base">
            {table.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-zinc-200 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-zinc-500" aria-hidden>
                ●
              </span>
              {table.seatedCount} / {table.maxSeats}
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-200/90">
              <span className="text-amber-500/80" aria-hidden>
                ◆
              </span>
              {table.waitingCount}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-black tabular-nums text-white sm:text-xl">{table.blindsLabel}</p>
        </div>
      </div>
      {table.footerText ? (
        <div className="border-t border-white/5 bg-black/25 px-3 py-2 sm:px-4">
          <p className="text-[10px] font-semibold uppercase leading-snug tracking-wide text-zinc-400 sm:text-[11px]">
            {table.footerText}
          </p>
        </div>
      ) : null}
    </article>
  );
}
