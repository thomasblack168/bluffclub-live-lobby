import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Supabase pooler (6543) + Prisma often hits "prepared statement already exists". Seed via direct DB URL.
const seedDbUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!seedDbUrl) {
  throw new Error("Set DIRECT_URL or DATABASE_URL in .env to run prisma db seed.");
}

const prisma = new PrismaClient({
  datasources: { db: { url: seedDbUrl } },
});

async function main() {
  const passwordPlain = process.env.SEED_STAFF_PASSWORD ?? "changeme";
  const password = await bcrypt.hash(passwordPlain, 10);

  await prisma.user.upsert({
    where: { email: "staff@bluffclub.live" },
    update: { password },
    create: {
      email: "staff@bluffclub.live",
      password,
      name: "Staff",
      role: "staff",
    },
  });

  const locSpecs = [
    { name: "X-POKER ONLINE", slug: "x-poker-online", variant: "online", sortOrder: 0 },
    { name: "LIVE RANGSIT", slug: "live-rangsit", variant: "rangsit", sortOrder: 1 },
    { name: "LIVE CHOK CHAI 4", slug: "live-chok-chai-4", variant: "chokchai4", sortOrder: 2 },
  ];

  const locations = [];
  for (const l of locSpecs) {
    const row = await prisma.location.upsert({
      where: { slug: l.slug },
      update: { name: l.name, variant: l.variant, sortOrder: l.sortOrder },
      create: l,
    });
    locations.push(row);
  }

  await prisma.pokerTable.deleteMany({});

  const bySlug = Object.fromEntries(locations.map((l) => [l.slug, l]));

  const samples = [
    {
      slug: "x-poker-online",
      title: "PUSOY 100BB",
      blinds: "20",
      max: 4,
      seated: 3,
      waiting: 2,
      footer: "X-POKER 24hr - HIGH HAND - BAD BEAT JACKPOT",
      logo: "Bluffx",
    },
    {
      slug: "x-poker-online",
      title: "PL06 VPIP35%",
      blinds: "20/40",
      max: 8,
      seated: 7,
      waiting: 3,
      footer: "X-POKER 24hr - HIGH HAND - BAD BEAT JACKPOT",
      logo: "Bluff Club",
    },
    {
      slug: "live-rangsit",
      title: "NLH 25-200BB",
      blinds: "5/10/20/STR",
      max: 9,
      seated: 6,
      waiting: 2,
      footer: "BLUFF CLUB @RANGSIT",
      logo: "XR Check-Raise",
    },
    {
      slug: "live-chok-chai-4",
      title: "NLH 25-200BB",
      blinds: "5/10/20/STR",
      max: 9,
      seated: 6,
      waiting: 2,
      footer: "XR @CHOK CHAI 4",
      logo: "XR Check-Raise",
    },
  ];

  let order = 0;
  for (const s of samples) {
    const loc = bySlug[s.slug];
    if (!loc) continue;
    await prisma.pokerTable.create({
      data: {
        locationId: loc.id,
        title: s.title,
        blindsLabel: s.blinds,
        maxSeats: s.max,
        seatedCount: s.seated,
        waitingCount: s.waiting,
        footerText: s.footer,
        logoKey: s.logo,
        sortOrder: order++,
        isActive: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
