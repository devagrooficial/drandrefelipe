import { randomBytes } from "node:crypto";
import type { FileChange } from "./storage";

const DATA_URL = /^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/;
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

// Checked against the bytes themselves; the declared MIME type is just a claim.
const SIGNATURES: Record<string, (bytes: Buffer) => boolean> = {
  webp: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  jpeg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  png: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
};

export class ImageError extends Error {}

function decode(dataUrl: string, prefix: string): { file: FileChange; src: string } {
  const match = DATA_URL.exec(dataUrl);
  if (!match) throw new ImageError("Formato de imagem não suportado. Use JPG, PNG ou WebP.");

  const [, type, base64] = match;
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > MAX_IMAGE_BYTES) throw new ImageError("Imagem muito grande (máximo 3 MB).");
  if (!SIGNATURES[type](bytes)) throw new ImageError("O arquivo enviado não é uma imagem válida.");

  const ext = type === "jpeg" ? "jpg" : type;
  const name = `${prefix}-${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.${ext}`;
  return { file: { path: `public/uploads/${name}`, content: bytes }, src: `/uploads/${name}` };
}

/**
 * Replaces every newly uploaded image (a data: URL in a `src` field) with the
 * path it will be served from, collecting the files to persist.
 */
export function extractUploads<T>(value: T, prefix: string): { value: T; files: FileChange[] } {
  const files: FileChange[] = [];

  const walk = (node: unknown, key?: string): unknown => {
    if (key === "src" && typeof node === "string" && node.startsWith("data:")) {
      const { file, src } = decode(node, prefix);
      files.push(file);
      return src;
    }
    if (Array.isArray(node)) return node.map((item) => walk(item));
    if (node && typeof node === "object") {
      return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, walk(v, k)]));
    }
    return node;
  };

  return { value: walk(value) as T, files };
}
