"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function markNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };
  if (!user.id) return { ok: false, error: "AUTH_REQUIRED" };

  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  return { ok: true };
}