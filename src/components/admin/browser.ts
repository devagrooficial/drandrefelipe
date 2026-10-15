const MAX_SIDE = 1600;

// Downscales and re-encodes in the browser before upload: keeps photos fast
// for PageSpeed and well under Vercel's 4.5 MB request limit.
export async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  // Browsers without WebP encoding silently return PNG; fall back to JPEG then.
  let blob = await encode("image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg", 0.85);
  if (!blob) throw new Error("Não foi possível processar a imagem.");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

const YOUTUBE_ID = /^[\w-]{11}$/;

export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (YOUTUBE_ID.test(value)) return value;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    const host = url.hostname.replace(/^(www\.|m\.)/, "");
    if (host === "youtu.be") return matchId(url.pathname.slice(1));
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) return matchId(fromQuery);
      const [, kind, id] = url.pathname.split("/");
      if (["shorts", "embed", "live", "v"].includes(kind)) return matchId(id);
    }
  } catch {
    // not a URL
  }
  return null;
}

const matchId = (candidate?: string) => (candidate && YOUTUBE_ID.test(candidate) ? candidate : null);
