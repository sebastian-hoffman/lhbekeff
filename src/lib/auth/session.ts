import "server-only";

import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken,
  type AdminSessionPayload,
} from "@/lib/auth/jwt";

/** Setea la cookie httpOnly de sesión tras un login exitoso. */
export async function setAdminSessionCookie(payload: AdminSessionPayload) {
  const token = await createAdminSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Para usar en Server Components / Server Actions. */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export type { AdminSessionPayload };
