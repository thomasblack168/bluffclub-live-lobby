import Link from "next/link";

export function LobbyHero({ showAdminLink }: { showAdminLink: boolean }) {
  return (
    <header className="w-full border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="px-4 py-8 sm:px-8 sm:py-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-200/90">Bluffclub Live</p>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          The right players.
        </h1>
        {showAdminLink ? (
          <Link
            href="/admin"
            className="mt-4 inline-flex w-fit text-xs font-semibold uppercase tracking-wide text-sky-300 underline-offset-4 hover:underline"
          >
            Staff dashboard
          </Link>
        ) : null}
      </div>
    </header>
  );
}
