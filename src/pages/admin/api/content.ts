import type { APIRoute } from "astro";
import { SECTION_LABELS } from "../../../components/admin/sections";
import { hasValidSession } from "../../../lib/admin/auth";
import { extractUploads, ImageError } from "../../../lib/admin/images";
import { saveSite, StorageError, storageMode } from "../../../lib/admin/storage";
import { SECTION_KEYS, sectionSchemas, type SectionKey } from "../../../lib/contentSchema";

export const prerender = false;

// Vercel rejects function bodies over 4.5 MB before they reach us.
const MAX_BODY_BYTES = 4 * 1024 * 1024;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const sameOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!hasValidSession(cookies)) {
    return json({ error: "Sua sessão expirou. Entre novamente." }, 401);
  }
  // Defense in depth on top of the SameSite=Strict session cookie.
  if (!sameOrigin(request)) return json({ error: "Origem da requisição inválida." }, 403);

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return json({ error: "Envio muito grande. Use imagens menores." }, 413);
  }

  let body: { section?: unknown; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Dados inválidos." }, 400);
  }

  const section = body.section as SectionKey;
  if (!SECTION_KEYS.includes(section)) return json({ error: "Seção desconhecida." }, 400);

  let uploads;
  try {
    uploads = extractUploads(body.data, section);
  } catch (error) {
    if (error instanceof ImageError) return json({ error: error.message }, 422);
    throw error;
  }

  const parsed = sectionSchemas[section].safeParse(uploads.value);
  if (!parsed.success) {
    return json(
      {
        error: "Alguns campos precisam de ajuste.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      422,
    );
  }

  try {
    const result = await saveSite(
      (current) => ({ ...current, [section]: parsed.data }),
      uploads.files,
      `Admin: atualiza "${SECTION_LABELS[section]}"`,
    );
    return json({ section: result.content[section], commitUrl: result.commitUrl, mode: storageMode() });
  } catch (error) {
    console.error("[admin] save failed", error);
    const message =
      error instanceof StorageError && (error.status === 401 || error.status === 403 || error.status === 404)
        ? "Não foi possível gravar no GitHub. Verifique o GITHUB_TOKEN (permissão de escrita no repositório)."
        : error instanceof StorageError && !error.status
          ? error.message
          : "Não foi possível salvar agora. Tente novamente em instantes.";
    return json({ error: message }, 502);
  }
};
