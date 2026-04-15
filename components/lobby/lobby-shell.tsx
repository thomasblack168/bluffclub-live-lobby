"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type { LobbyLocation, LobbyTable } from "@/types/lobby";
import { LobbyHero } from "./hero";
import { LocationTabs } from "./location-tabs";
import { TableCard } from "./table-card";

type LocationEmbed = {
  id: string;
  name: string;
  slug: string;
  variant: string;
  sort_order: number;
};

type Row = {
  id: string;
  title: string;
  blinds_label: string;
  max_seats: number;
  seated_count: number;
  waiting_count: number;
  footer_text: string;
  logo_key: string | null;
  sort_order: number;
  locations: LocationEmbed | LocationEmbed[] | null;
};

function normalizeLocation(raw: LocationEmbed | LocationEmbed[] | null): LocationEmbed | null {
  if (raw == null) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

function mapRow(row: Row): LobbyTable | null {
  const loc = normalizeLocation(row.locations);
  if (!loc) return null;
  return {
    id: row.id,
    title: row.title,
    blindsLabel: row.blinds_label,
    maxSeats: row.max_seats,
    seatedCount: row.seated_count,
    waitingCount: row.waiting_count,
    footerText: row.footer_text,
    logoKey: row.logo_key,
    sortOrder: row.sort_order,
    location: {
      id: loc.id,
      name: loc.name,
      slug: loc.slug,
      variant: loc.variant,
      sortOrder: loc.sort_order,
    },
  };
}

type Props = {
  initialLocations: LobbyLocation[];
  initialTables: LobbyTable[];
  showAdminLink: boolean;
};

export function LobbyShell({ initialLocations, initialTables, showAdminLink }: Props) {
  const [filter, setFilter] = useState<"all" | string>("all");
  const [tables, setTables] = useState<LobbyTable[]>(initialTables);
  const [realtimeReady, setRealtimeReady] = useState(false);
  const reduceMotion = useReducedMotion();
  const supabase = useMemo(() => getBrowserSupabase(), []);

  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  const refetch = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("poker_tables")
      .select(
        "id,title,blinds_label,max_seats,seated_count,waiting_count,footer_text,logo_key,sort_order,locations(id,name,slug,variant,sort_order)",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data) return;
    const rows = data as unknown as Row[];
    setTables(rows.map(mapRow).filter((t): t is LobbyTable => t != null));
  }, [supabase]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefetch = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null;
      void refetch();
    }, 280);
  }, [refetch]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("lobby-poker-tables")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poker_tables" },
        () => {
          scheduleRefetch();
        },
      )
      .subscribe((status) => {
        setRealtimeReady(status === "SUBSCRIBED");
      });

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setRealtimeReady(false);
      void supabase.removeChannel(channel);
    };
  }, [supabase, scheduleRefetch]);

  useEffect(() => {
    if (!supabase) return;
    const id = setInterval(() => {
      // Fallback: keep numbers moving even when Realtime publication is misconfigured.
      void refetch();
    }, 5000);
    return () => clearInterval(id);
  }, [supabase, refetch]);

  const filtered = useMemo(() => {
    if (filter === "all") return tables;
    return tables.filter((t) => t.location.slug === filter);
  }, [tables, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.title.localeCompare(b.title);
    });
  }, [filtered]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <LobbyHero showAdminLink={showAdminLink} />
      <LocationTabs locations={initialLocations} active={filter} onChange={setFilter} />
      <main className="mx-auto max-w-3xl space-y-3 px-3 py-5 sm:px-6">
        {supabase === null ? (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-xs text-amber-100/90"
          >
            Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> for live updates. Data below is from the
            last server load.
          </motion.p>
        ) : !realtimeReady ? (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300"
          >
            Realtime is reconnecting. Auto-refresh every 5s is active.
          </motion.p>
        ) : null}
        {sorted.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 py-10 uppercase tracking-wide">No active tables</p>
        ) : (
          <AnimatePresence initial={false}>
            {sorted.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.99 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <TableCard table={t} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
