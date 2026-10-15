import { useEffect, useState } from "react";
import type { SectionKey, SiteContent } from "../../lib/contentSchema";
import type { StorageMode } from "../../lib/admin/storage";
import { FieldList, pathKey, type Errors, type Path } from "./fields";
import { SECTIONS } from "./sections";

interface Props {
  initialContent: SiteContent;
  mode: StorageMode;
}

type Status = { kind: "success" | "error"; text: string; link?: { href: string; label: string } };

// Leaves headroom under Vercel's 4.5 MB request body limit.
const MAX_PAYLOAD_CHARS = 4_000_000;

function setIn(target: any, path: Path, value: unknown): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const copy = Array.isArray(target) ? [...target] : { ...target };
  copy[head as any] = setIn(target?.[head as any], rest, value);
  return copy;
}

const MODE_NOTICE: Record<StorageMode, { tone: string; text: string }> = {
  github: {
    tone: "bg-accent/15 text-primary ring-accent/30",
    text: "Ao salvar, o site é republicado automaticamente — as mudanças aparecem em cerca de 1 minuto.",
  },
  local: {
    tone: "bg-sky-50 text-sky-900 ring-sky-200",
    text: "Modo de desenvolvimento: as alterações são gravadas direto nos arquivos do projeto.",
  },
  unconfigured: {
    tone: "bg-red-50 text-red-900 ring-red-200",
    text: "Salvar está desativado: configure a variável GITHUB_TOKEN na Vercel.",
  },
};

export default function AdminApp({ initialContent, mode }: Props) {
  const [saved, setSaved] = useState(initialContent);
  const [draft, setDraft] = useState(initialContent);
  const [active, setActive] = useState<SectionKey>("hero");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status | null>(null);
  const [saving, setSaving] = useState(false);

  const section = SECTIONS.find((s) => s.key === active)!;
  const isDirty = (key: SectionKey) => JSON.stringify(draft[key]) !== JSON.stringify(saved[key]);
  const dirty = isDirty(active);
  const anyDirty = SECTIONS.some((s) => isDirty(s.key));

  useEffect(() => {
    const fromHash = window.location.hash.slice(1) as SectionKey;
    if (SECTIONS.some((s) => s.key === fromHash)) setActive(fromHash);
  }, []);

  useEffect(() => {
    if (!anyDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  const open = (key: SectionKey) => {
    setActive(key);
    setErrors({});
    setStatus(null);
    history.replaceState(null, "", `#${key}`);
    window.scrollTo({ top: 0 });
  };

  const onChange = (path: Path, value: unknown) => {
    setDraft((current) => ({ ...current, [active]: setIn(current[active], path, value) }));
    const key = pathKey(path);
    setErrors((current) => {
      if (!(key in current)) return current;
      const { [key]: _removed, ...rest } = current;
      return rest;
    });
  };

  const discard = () => {
    setDraft((current) => ({ ...current, [active]: saved[active] }));
    setErrors({});
    setStatus(null);
  };

  const save = async () => {
    const payload = JSON.stringify({ section: active, data: draft[active] });
    if (payload.length > MAX_PAYLOAD_CHARS) {
      setStatus({
        kind: "error",
        text: "As imagens novas desta seção ficaram grandes demais juntas. Troque e salve uma de cada vez.",
      });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/admin/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const body = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setStatus({
          kind: "error",
          text: body.error ?? "Sua sessão expirou.",
          link: { href: "/admin/login", label: "Entrar novamente" },
        });
        return;
      }
      if (!response.ok) {
        const issues: { path: string; message: string }[] = body.issues ?? [];
        setErrors(Object.fromEntries(issues.map((issue) => [issue.path, issue.message])));
        setStatus({ kind: "error", text: body.error ?? "Não foi possível salvar." });
        return;
      }

      setSaved((current) => ({ ...current, [active]: body.section }));
      setDraft((current) => ({ ...current, [active]: body.section }));
      setErrors({});
      setStatus({
        kind: "success",
        text:
          body.mode === "github"
            ? "Salvo! O site será atualizado em cerca de 1 minuto."
            : "Salvo nos arquivos do projeto.",
        link: body.commitUrl ? { href: body.commitUrl, label: "Ver registro da alteração" } : undefined,
      });
    } catch {
      setStatus({ kind: "error", text: "Sem conexão. Verifique a internet e tente novamente." });
    } finally {
      setSaving(false);
    }
  };

  const notice = MODE_NOTICE[mode];

  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-primary text-cream lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <img src="/images/logo-reversed.png" alt="Dr. André Felipe Moura" className="h-12 w-auto" />
            <p className="mt-1 text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">Painel do site</p>
          </div>
          <form method="post" action="/admin/logout" className="lg:hidden">
            <button className="rounded-full border border-cream/25 px-4 py-2 text-xs font-semibold">Sair</button>
          </form>
        </div>

        <nav aria-label="Seções" className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:gap-1 lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-current={s.key === active ? "page" : undefined}
              onClick={() => open(s.key)}
              className={[
                "flex shrink-0 items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-colors",
                s.key === active ? "bg-cream text-primary font-semibold" : "text-cream/75 hover:bg-cream/10 hover:text-cream",
              ].join(" ")}
            >
              {s.label}
              {isDirty(s.key) && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent" title="Alterações não salvas" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-cream/10 p-4 lg:block">
          <a href="/" target="_blank" rel="noopener" className="block rounded-xl px-4 py-2.5 text-sm text-cream/75 hover:bg-cream/10 hover:text-cream">
            Ver site ↗
          </a>
          <form method="post" action="/admin/logout">
            <button className="w-full rounded-xl px-4 py-2.5 text-left text-sm text-cream/75 hover:bg-cream/10 hover:text-cream">
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-primary/10 bg-cream/90 px-6 py-5 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-primary">{section.label}</h1>
              <p className="mt-0.5 text-sm text-primary/60">{section.description}</p>
            </div>
            <a
              href={section.siteAnchor}
              target="_blank"
              rel="noopener"
              className="shrink-0 rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-semibold text-primary transition-colors hover:border-accent"
            >
              Ver no site ↗
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-6 pt-6 pb-40">
          <p className={`rounded-2xl px-5 py-3 text-sm ring-1 ${notice.tone}`}>{notice.text}</p>

          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-primary/10 sm:p-8">
            <FieldList
              key={active}
              fields={section.fields}
              value={draft[active]}
              path={[]}
              onChange={onChange}
              errors={errors}
            />
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-primary/10 bg-white/95 px-6 py-4 backdrop-blur lg:left-72">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              role="status"
              className={[
                "text-sm",
                status?.kind === "error" ? "font-medium text-red-700" : "",
                status?.kind === "success" ? "font-medium text-emerald-700" : "",
                !status ? "text-primary/55" : "",
              ].join(" ")}
            >
              {status ? status.text : dirty ? "Você tem alterações não salvas nesta seção." : "Tudo salvo."}
              {status?.link && (
                <>
                  {" "}
                  <a href={status.link.href} target="_blank" rel="noopener" className="underline underline-offset-2">
                    {status.link.label}
                  </a>
                </>
              )}
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={discard}
                disabled={!dirty || saving}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-primary/70 transition-colors hover:bg-primary/5 disabled:opacity-40"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving || mode === "unconfigured"}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-primary-light disabled:opacity-40"
              >
                {saving ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
