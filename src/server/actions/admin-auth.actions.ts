"use server";

import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import { clearAdminSessionCookie, setAdminSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/admin.schema";

export type AdminLoginResult = { success: true } | { success: false; error: string };

export async function adminLogin(input: AdminLoginInput): Promise<AdminLoginResult> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { email, password } = parsed.data;

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return { success: false, error: "Email o contraseña incorrectos." };
  }

  const isValid = await verifyPassword(password, admin.passwordHash);
  if (!isValid) {
    return { success: false, error: "Email o contraseña incorrectos." };
  }

  await setAdminSessionCookie({ adminId: admin.id, email: admin.email, name: admin.name });
  return { success: true };
}

export async function adminLogout() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
