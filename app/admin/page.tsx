import Link from "next/link";
import { CreateTableForm } from "@/components/admin/create-table-form";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { TableEditorCard } from "@/components/admin/table-editor-card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [locations, tables] = await Promise.all([
    prisma.location.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.pokerTable.findMany({
      include: { location: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/90 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Bluffclub Live</p>
            <h1 className="text-xl font-black uppercase tracking-tight">Staff dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-200 hover:bg-zinc-800"
            >
              Lobby
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-8">
        <CreateTableForm locations={locations} />
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-300">Tables</h2>
          {tables.length === 0 ? (
            <p className="text-sm text-zinc-500">No tables yet. Create one above.</p>
          ) : (
            <div className="space-y-4">
              {tables.map((t) => (
                <TableEditorCard key={t.id} table={t} locations={locations} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
