import { timingSafeEqual } from "node:crypto";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const expectedToken = process.env.ADMIN_RESET_TOKEN;
  const providedToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const adminEmail = process.env.ADMIN_EMAIL;
  const newPassword = process.env.ADMIN_PASSWORD;

  if (!expectedToken || !providedToken || !adminEmail || !newPassword) {
    return new Response(null, { status: 404, headers: noStore });
  }

  const expected = Buffer.from(expectedToken);
  const provided = Buffer.from(providedToken);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return new Response(null, { status: 404, headers: noStore });
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email: adminEmail },
      select: { id: true },
    });

    if (!admin) return new Response(null, { status: 404, headers: noStore });

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return Response.json({ ok: true }, { headers: noStore });
  } catch {
    return new Response(null, { status: 503, headers: noStore });
  }
}
