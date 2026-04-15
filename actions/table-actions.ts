"use server";

import { auth } from "@/auth";
import { actionErr, actionOk, type ActionResult } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { formatZodFormError, tableSchema } from "@/lib/table-schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireStaffAction(): Promise<ActionResult | null> {
  let session;
  try {
    session = await auth();
  } catch {
    return actionErr("Unauthorized");
  }
  if (!session?.user || session.user.role !== "staff") {
    return actionErr("Unauthorized");
  }
  return null;
}

function formDataWithoutIntent(formData: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (k === "intent") continue;
    o[k] = v;
  }
  return o;
}

export async function createTableFormAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireStaffAction();
  if (denied) return denied;

  const parsed = tableSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return actionErr(formatZodFormError(parsed));

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
  return actionOk();
}

export async function adminTableDispatchAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireStaffAction();
  if (denied) return denied;

  const intent = formData.get("intent");
  if (intent === "delete") {
    const idParsed = z.string().min(1).safeParse(formData.get("id"));
    if (!idParsed.success) return actionErr("Missing table id");
    try {
      await prisma.pokerTable.delete({ where: { id: idParsed.data } });
    } catch {
      return actionErr("Table not found or could not be deleted");
    }
    revalidatePath("/");
    revalidatePath("/admin");
    return actionOk();
  }

  if (intent === "seat") {
    const idParsed = z.string().min(1).safeParse(formData.get("id"));
    const deltaParsed = z.coerce.number().int().safeParse(formData.get("delta"));
    if (!idParsed.success || !deltaParsed.success) return actionErr("Invalid seated adjustment");
    const t = await prisma.pokerTable.findUnique({ where: { id: idParsed.data } });
    if (!t) return actionErr("Table not found");
    const next = Math.max(0, Math.min(t.maxSeats, t.seatedCount + deltaParsed.data));
    await prisma.pokerTable.update({ where: { id: idParsed.data }, data: { seatedCount: next } });
    revalidatePath("/");
    revalidatePath("/admin");
    return actionOk();
  }

  if (intent === "wait") {
    const idParsed = z.string().min(1).safeParse(formData.get("id"));
    const deltaParsed = z.coerce.number().int().safeParse(formData.get("delta"));
    if (!idParsed.success || !deltaParsed.success) return actionErr("Invalid waiting adjustment");
    const t = await prisma.pokerTable.findUnique({ where: { id: idParsed.data } });
    if (!t) return actionErr("Table not found");
    const next = Math.max(0, t.waitingCount + deltaParsed.data);
    await prisma.pokerTable.update({ where: { id: idParsed.data }, data: { waitingCount: next } });
    revalidatePath("/");
    revalidatePath("/admin");
    return actionOk();
  }

  if (intent === "update") {
    const idParsed = z.string().min(1).safeParse(formData.get("id"));
    if (!idParsed.success) return actionErr("Missing table id");
    const parsed = tableSchema.safeParse(formDataWithoutIntent(formData));
    if (!parsed.success) return actionErr(formatZodFormError(parsed));
    try {
      await prisma.pokerTable.update({
        where: { id: idParsed.data },
        data: {
          ...parsed.data,
          footerText: parsed.data.footerText ?? "",
        },
      });
    } catch {
      return actionErr("Table not found or could not be updated");
    }
    revalidatePath("/");
    revalidatePath("/admin");
    return actionOk();
  }

  return actionErr("Unknown action");
}
