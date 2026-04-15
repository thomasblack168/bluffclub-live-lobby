import { PrismaClient } from "@prisma/client";

type PrismaGlobal = {
  prisma?: PrismaClient;
  /** Last URL passed into `new PrismaClient({ datasources })` — used to drop stale clients after env/HMR changes. */
  prismaResolvedUrl?: string;
};

const globalRef = globalThis as unknown as PrismaGlobal;

/**
 * Supabase transaction pooler (:6543) + Prisma + Turbopack often throws
 * "prepared statement … does not exist / already exists". Prefer `DIRECT_URL`
 * (port 5432) whenever it is set and we are not on Vercel (see `.env.example`).
 */
function databaseUrlForRuntime(): string {
  const pooled = process.env.DATABASE_URL;
  const direct = process.env.DIRECT_URL;
  if (!pooled) {
    throw new Error("DATABASE_URL is not set");
  }

  const forcePooler =
    process.env.PRISMA_FORCE_POOLER === "1" || process.env.PRISMA_DEV_USE_POOLER === "1";
  const onVercel = process.env.VERCEL === "1";

  if (direct && !forcePooler && !onVercel) {
    return direct;
  }
  return pooled;
}

function createClient(url: string) {
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const resolvedUrl = databaseUrlForRuntime();

if (globalRef.prisma && globalRef.prismaResolvedUrl !== resolvedUrl) {
  void globalRef.prisma.$disconnect();
  globalRef.prisma = undefined;
  globalRef.prismaResolvedUrl = undefined;
}

if (!globalRef.prisma) {
  globalRef.prisma = createClient(resolvedUrl);
  globalRef.prismaResolvedUrl = resolvedUrl;
}

export const prisma = globalRef.prisma;
