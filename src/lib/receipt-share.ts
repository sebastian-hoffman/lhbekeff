import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const RECEIPT_SHARE_TTL_DAYS = 7;

const RECEIPT_SHARE_AUDIENCE = "bekeff-receipt-share";
const RECEIPT_PATH_PATTERN = /^receipts\/[A-Za-z0-9._-]+$/;

function getSigningKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Falta la variable de entorno AUTH_SECRET.");
  return new TextEncoder().encode(secret);
}

export async function createReceiptShareToken(receiptPath: string): Promise<string> {
  if (!RECEIPT_PATH_PATTERN.test(receiptPath)) {
    throw new Error("Ruta de comprobante inválida.");
  }

  return new SignJWT({ receiptPath })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(RECEIPT_SHARE_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${RECEIPT_SHARE_TTL_DAYS}d`)
    .sign(getSigningKey());
}

export async function verifyReceiptShareToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      audience: RECEIPT_SHARE_AUDIENCE,
    });
    if (typeof payload.receiptPath !== "string") return null;
    return RECEIPT_PATH_PATTERN.test(payload.receiptPath) ? payload.receiptPath : null;
  } catch {
    return null;
  }
}