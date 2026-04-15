import Image from "next/image";
import Link from "next/link";

export function LobbyHero({ showAdminLink }: { showAdminLink: boolean }) {
  return (
    <header className="relative w-full overflow-hidden border-b border-zinc-800">
      <div className="relative h-44 sm:h-56 w-full">
        <Image
          src="/hero-poker.png"
          alt="Poker table with chips"
          fill
          priority
          className="object-cover object-center brightness-[0.45]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-5 sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-200/90">Bluffclub Live</p>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            The right players.
          </h1>
          {showAdminLink ? (
            <Link
              href="/admin"
              className="mt-3 inline-flex w-fit text-xs font-semibold uppercase tracking-wide text-sky-300 underline-offset-4 hover:underline"
            >
              Staff dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
