import { SignJWT, jwtVerify } from "jose";

/**
 * Firma/verificación de la sesión de admin. Deliberadamente sin
 * `import "server-only"`: este módulo lo usa tanto `lib/auth/session.ts`
 * (Server Components/Actions) como `middleware.ts` (Edge runtime), y no
 * depende de ninguna API exclusiva de Node.
 */

export const SESSION_COOKIE = "bekeff_admin_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 días

export type AdminSessionPayload = {
  adminId: string;
  email: string;
  name: string;
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Falta la variable de entorno AUTH_SECRET.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(
  payload: AdminSessionPayload,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAdminSessionToken(
  token: string,
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify<AdminSessionPayload>(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}
