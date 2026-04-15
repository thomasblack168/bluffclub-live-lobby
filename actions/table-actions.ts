"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireStaff() {
  let session;
  try {
    session = await auth();
  } catch {
    throw new Error("Unauthorized");
  }
  if (!session?.user || session.user.role !== "staff") {
    throw new Error("Unauthorized");
  }
}

const tableSchema = z.object({
  locationId: z.string().min(1),
  title: z.string().min(1),
  blindsLabel: z.string().min(1),
  maxSeats: z.coerce.number().int().min(1).max(20),
  footerText: z.string().optional().default(""),
  logoKey: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => {
      if (v == null) return null;
      const s = String(v).trim();
      return s.length ? s : null;
    }),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export async function createTableAction(formData: FormData) {
  await requireStaff();
  const parsed = tableSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid form");
  await prisma.pokerTable.create({
    data: {
      ...parsed.data,
      footerText: parsed.data.footerText ?? "",
      seatedCount: 0,
      waitingCount: 0,
      isActive: true,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateTableAction(formData: FormData) {
  await requireStaff();
  const id = z.string().min(1).parse(formData.get("id"));
  const parsed = tableSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid form");
  await prisma.pokerTable.update({
    where: { id },
    data: {
      ...parsed.data,
      footerText: parsed.data.footerText ?? "",
    },
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteTableAction(id: string) {
  await requireStaff();
  await prisma.pokerTable.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function adjustSeatedAction(id: string, delta: number) {
  await requireStaff();
  const t = await prisma.pokerTable.findUnique({ where: { id } });
  if (!t) throw new Error("Not found");
  const next = Math.max(0, Math.min(t.maxSeats, t.seatedCount + delta));
  await prisma.pokerTable.update({ where: { id }, data: { seatedCount: next } });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function adjustWaitingAction(id: string, delta: number) {
  await requireStaff();
  const t = await prisma.pokerTable.findUnique({ where: { id } });
  if (!t) throw new Error("Not found");
  const next = Math.max(0, t.waitingCount + delta);
  await prisma.pokerTable.update({ where: { id }, data: { waitingCount: next } });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function adjustSeatedFormAction(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  const delta = z.coerce.number().int().parse(formData.get("delta"));
  await adjustSeatedAction(id, delta);
}

export async function adjustWaitingFormAction(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  const delta = z.coerce.number().int().parse(formData.get("delta"));
  await adjustWaitingAction(id, delta);
}

export async function deleteTableFormAction(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  await deleteTableAction(id);
}
