import { auth } from "@/auth";
import { LobbyShell } from "@/components/lobby/lobby-shell";
import { prisma } from "@/lib/prisma";
import type { LobbyLocation, LobbyTable } from "@/types/lobby";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const [locations, tables] = await Promise.all([
    prisma.location.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.pokerTable.findMany({
      where: { isActive: true },
      include: { location: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    }),
  ]);

  const initialLocations: LobbyLocation[] = locations.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    variant: l.variant,
    sortOrder: l.sortOrder,
  }));

  const initialTables: LobbyTable[] = tables.map((t) => ({
    id: t.id,
    title: t.title,
    blindsLabel: t.blindsLabel,
    maxSeats: t.maxSeats,
    seatedCount: t.seatedCount,
    waitingCount: t.waitingCount,
    footerText: t.footerText,
    logoKey: t.logoKey,
    sortOrder: t.sortOrder,
    location: {
      id: t.location.id,
      name: t.location.name,
      slug: t.location.slug,
      variant: t.location.variant,
      sortOrder: t.location.sortOrder,
    },
  }));

  const showAdminLink = session?.user?.role === "staff";

  return (
    <LobbyShell
      initialLocations={initialLocations}
      initialTables={initialTables}
      showAdminLink={showAdminLink}
    />
  );
}
