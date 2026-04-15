"use client";

import { createTableFormAction } from "@/actions/table-actions";
import { AnimatePresence, motion } from "framer-motion";
import type { ActionResult } from "@/lib/action-result";
import { useActionState } from "react";

type Loc = { id: string; name: string; slug: string };

export function CreateTableForm({ locations }: { locations: Loc[] }) {
  const [state, formAction, pending] = useActionState(createTableFormAction, undefined as ActionResult | undefined);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-200">Add table</h2>
      <AnimatePresence initial={false}>
        {state && !state.ok ? (
          <motion.p
            key="create-error"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-red-400"
          >
            {state.message}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Location
          <select
            name="locationId"
            required
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-zinc-100"
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
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
            placeholder="NLH 25-200BB"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Blinds
          <input
            name="blindsLabel"
            required
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
            placeholder="5/10/20/STR"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Max seats
          <input
            name="maxSeats"
            type="number"
            min={1}
            max={20}
            defaultValue={9}
            required
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400 sm:col-span-2">
          Footer / tags
          <input
            name="footerText"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
            placeholder="X-POKER 24hr - HIGH HAND"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Logo label
          <input
            name="logoKey"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
            placeholder="Bluffx"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase text-zinc-400">
          Sort order
          <input
            name="sortOrder"
            type="number"
            defaultValue={0}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-200 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={pending ? "creating" : "create"}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center gap-2"
              >
                {pending ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    Creating...
                  </>
                ) : (
                  "Create table"
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </form>
    </section>
  );
}
