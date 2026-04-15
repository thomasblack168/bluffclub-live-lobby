"use client";

import { adminTableDispatchAction } from "@/actions/table-actions";
import { AnimatePresence, motion } from "framer-motion";
import type { ActionResult } from "@/lib/action-result";
import type { Location, PokerTable } from "@prisma/client";
import { useActionState } from "react";

type TableWithLocation = PokerTable & { location: Location };

export function TableEditorCard({ table, locations }: { table: TableWithLocation; locations: Location[] }) {
  const [state, formAction, pending] = useActionState(
    adminTableDispatchAction,
    undefined as ActionResult | undefined,
  );

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-4 transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
      <AnimatePresence initial={false}>
        {state && !state.ok ? (
          <motion.p
            key="table-editor-error"
            className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200"
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {state.message}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{table.location.name}</p>
          <h3 className="text-lg font-black uppercase tracking-tight text-white">{table.title}</h3>
          <p className="text-xs text-zinc-400">
            Seated {table.seatedCount}/{table.maxSeats} · Waiting {table.waitingCount} · Blinds {table.blindsLabel}
          </p>
        </div>
        <form action={formAction}>
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="id" value={table.id} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-1.5 text-xs font-bold uppercase text-red-200 transition-transform duration-200 hover:bg-red-950/70 active:scale-[0.98] disabled:opacity-50"
          >
            Delete
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Seated</p>
          <div className="flex items-center gap-2">
            <form action={formAction}>
              <input type="hidden" name="intent" value="seat" />
              <input type="hidden" name="id" value={table.id} />
              <input type="hidden" name="delta" value={-1} />
              <button
                type="submit"
                disabled={pending}
                className="h-9 w-9 rounded-lg border border-zinc-700 text-lg font-bold text-zinc-100 hover:bg-zinc-800 disabled:opacity-50"
              >
                −
              </button>
            </form>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`seat-${table.seatedCount}`}
                className="min-w-[3ch] text-center text-sm font-bold tabular-nums"
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 1.04 }}
                transition={{ duration: 0.2 }}
              >
                {table.seatedCount}
              </motion.span>
            </AnimatePresence>
            <form action={formAction}>
              <input type="hidden" name="intent" value="seat" />
              <input type="hidden" name="id" value={table.id} />
              <input type="hidden" name="delta" value={1} />
              <button
                type="submit"
                disabled={pending}
                className="h-9 w-9 rounded-lg border border-zinc-700 text-lg font-bold text-zinc-100 hover:bg-zinc-800 disabled:opacity-50"
              >
                +
              </button>
            </form>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Waiting</p>
          <div className="flex items-center gap-2">
            <form action={formAction}>
              <input type="hidden" name="intent" value="wait" />
              <input type="hidden" name="id" value={table.id} />
              <input type="hidden" name="delta" value={-1} />
              <button
                type="submit"
                disabled={pending}
                className="h-9 w-9 rounded-lg border border-zinc-700 text-lg font-bold text-zinc-100 hover:bg-zinc-800 disabled:opacity-50"
              >
                −
              </button>
            </form>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`wait-${table.waitingCount}`}
                className="min-w-[3ch] text-center text-sm font-bold tabular-nums"
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 1.04 }}
                transition={{ duration: 0.2 }}
              >
                {table.waitingCount}
              </motion.span>
            </AnimatePresence>
            <form action={formAction}>
              <input type="hidden" name="intent" value="wait" />
              <input type="hidden" name="id" value={table.id} />
              <input type="hidden" name="delta" value={1} />
              <button
                type="submit"
                disabled={pending}
                className="h-9 w-9 rounded-lg border border-zinc-700 text-lg font-bold text-zinc-100 hover:bg-zinc-800 disabled:opacity-50"
              >
                +
              </button>
            </form>
          </div>
        </div>
      </div>

      <form action={formAction} className="grid gap-3 border-t border-zinc-800 pt-4 sm:grid-cols-2">
        <input type="hidden" name="intent" value="update" />
        <input type="hidden" name="id" value={table.id} />
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Location
          <select
            name="locationId"
            required
            defaultValue={table.locationId}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Title
          <input
            name="title"
            required
            defaultValue={table.title}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Blinds
          <input
            name="blindsLabel"
            required
            defaultValue={table.blindsLabel}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Max seats
          <input
            name="maxSeats"
            type="number"
            min={1}
            max={20}
            required
            defaultValue={table.maxSeats}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400 sm:col-span-2">
          Footer / tags
          <input
            name="footerText"
            defaultValue={table.footerText}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Logo label
          <input
            name="logoKey"
            defaultValue={table.logoKey ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Sort order
          <input
            name="sortOrder"
            type="number"
            defaultValue={table.sortOrder}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-200 hover:bg-sky-600 active:scale-[0.98] disabled:opacity-50"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={pending ? "saving" : "save"}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center gap-2"
              >
                {pending ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </form>
    </article>
  );
}
