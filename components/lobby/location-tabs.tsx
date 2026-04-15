"use client";

import { motion } from "framer-motion";
import type { LobbyLocation } from "@/types/lobby";

type Props = {
  locations: LobbyLocation[];
  active: "all" | string;
  onChange: (slug: "all" | string) => void;
};

export function LocationTabs({ locations, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-950/90 px-3 py-3 sm:px-6">
      <span className="rounded bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-200">
        All tables
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={`relative rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
            active === "all"
              ? "bg-zinc-100 text-zinc-900"
              : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {active === "all" ? (
            <motion.span
              layoutId="active-location-pill"
              className="absolute inset-0 -z-10 rounded-full bg-zinc-100"
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
            />
          ) : null}
          All
        </button>
        {locations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => onChange(loc.slug)}
            className={`relative rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
              active === loc.slug
                ? loc.variant === "online"
                  ? "bg-sky-600 text-white"
                  : loc.variant === "rangsit"
                    ? "bg-amber-700 text-white"
                    : "bg-zinc-200 text-zinc-900"
                : loc.variant === "online"
                  ? "bg-sky-950 text-sky-200 hover:bg-sky-900"
                  : loc.variant === "rangsit"
                    ? "bg-amber-950 text-amber-100 hover:bg-amber-900"
                    : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
            }`}
          >
            {active === loc.slug ? (
              <motion.span
                layoutId="active-location-pill"
                className="absolute inset-0 -z-10 rounded-full bg-current/20"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
              />
            ) : null}
            {loc.name}
          </button>
        ))}
      </div>
    </div>
  );
}
