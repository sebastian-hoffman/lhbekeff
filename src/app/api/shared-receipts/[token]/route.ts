import { NextResponse } from "next/server";
import { readReceipt } from "@/lib/storage";
import { verifyReceiptShareToken } from "@/lib/receipt-share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const receiptPath = await verifyReceiptShareToken(token);
  if (!receiptPath) return new Response(null, { status: 404, headers: privateHeaders });

  try {
    const buffer = await readReceipt(receiptPath);
    const fileName = receiptPath.split("/").at(-1) ?? "comprobante";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        ...privateHeaders,
        "Content-Type": guessContentType(fileName),
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch {
    return new Response(null, { status: 404, headers: privateHeaders });
  }
}

function guessContentType(fileName: string) {
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
  if (fileName.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}