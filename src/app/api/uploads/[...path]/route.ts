import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { readReceipt } from "@/lib/storage";

/**
 * Sirve los comprobantes subidos. Solo accesible para el admin logueado: el
 * comprador no necesita volver a ver su comprobante después de subirlo.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { path } = await params;
  const relativePath = path.join("/");

  try {
    const buffer = await readReceipt(relativePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": guessContentType(relativePath),
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }
}

function guessContentType(path: string): string {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}
