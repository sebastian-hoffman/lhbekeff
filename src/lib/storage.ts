import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Guardado de comprobantes en el filesystem local. En Railway, `UPLOADS_DIR`
 * debe apuntar a un Volume persistente montado en el contenedor (ver
 * README). Esta es la única pieza del sistema con dependencia real de
 * infraestructura de archivos: si el día de mañana hace falta migrar a
 * S3/R2, solo hay que reimplementar `saveReceipt`/`readReceipt` respetando
 * esta misma firma.
 */

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export type SavedReceipt = {
  /** Ruta relativa a UPLOADS_DIR, la que se guarda en Purchase.receiptUrl */
  relativePath: string;
  mimeType: string;
};

export class UnsupportedFileError extends Error {}

function uploadsRoot(): string {
  return path.resolve(process.env.UPLOADS_DIR ?? "./uploads");
}

export async function saveReceipt(
  file: File,
  purchaseCode: string,
): Promise<SavedReceipt> {
  const extension = ALLOWED_MIME_TYPES[file.type];
  if (!extension) {
    throw new UnsupportedFileError(
      "Formato no soportado. Subí una imagen (JPG/PNG) o un PDF.",
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UnsupportedFileError("El archivo supera el tamaño máximo de 8 MB.");
  }

  const filename = `${purchaseCode}-${Date.now()}.${extension}`;
  const relativePath = path.posix.join("receipts", filename);
  const absolutePath = path.join(uploadsRoot(), relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return { relativePath, mimeType: file.type };
}

/** Lee un comprobante ya guardado a partir de su ruta relativa. */
export async function readReceipt(relativePath: string): Promise<Buffer> {
  const safePath = resolveSafely(relativePath);
  return readFile(safePath);
}

/** Borra un comprobante ya guardado. No falla si el archivo no existe. */
export async function deleteReceipt(relativePath: string): Promise<void> {
  const safePath = resolveSafely(relativePath);
  try {
    await unlink(safePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

/** Evita path traversal si algún día la ruta llega desde un parámetro de URL. */
function resolveSafely(relativePath: string): string {
  const root = uploadsRoot();
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error("Ruta de archivo inválida.");
  }
  return resolved;
}
