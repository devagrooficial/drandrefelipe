import { useEffect, useState, type ReactNode } from "react";
import { compressImage, parseYouTubeId } from "./browser";
import type { Field } from "./sections";

export type Path = (string | number)[];
export type Errors = Record<string, string>;

interface FieldProps<F extends Field = Field> {
  field: F;
  value: any;
  path: Path;
  onChange: (path: Path, value: unknown) => void;
  errors: Errors;
}

export const pathKey = (path: Path) => path.join(".");
const childPath = (path: Path, key: string) => (key === "" ? path : [...path, key]);
const read = (value: any, key: string) => (key === "" ? value : value?.[key]);
const domId = (path: Path) => `f-${pathKey(path).replace(/[^\w-]/g, "-") || "root"}`;

const inputClass = (error?: string) =>
  [
    "block w-full rounded-xl border bg-white px-4 py-2.5 text-[15px] text-primary outline-none transition",
    "placeholder:text-primary/30 focus:border-accent focus:ring-2 focus:ring-accent/25",
    error ? "border-red-400" : "border-primary/15",
  ].join(" ");

const smallButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-full text-primary/50 transition-colors hover:bg-primary/5 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent";

function Labeled(props: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-semibold text-primary">
        {props.label}
      </label>
      {props.help && <p className="mt-0.5 text-xs text-primary/55">{props.help}</p>}
      <div className="mt-2">{props.children}</div>
      {props.error && <p className="mt-1.5 text-xs font-medium text-red-700">{props.error}</p>}
    </div>
  );
}

export function FieldList({
  fields,
  value,
  path,
  onChange,
  errors,
}: Omit<FieldProps, "field"> & { fields: Field[] }) {
  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <FieldView
          key={`${field.key}-${field.label}`}
          field={field}
          value={read(value, field.key)}
          path={childPath(path, field.key)}
          onChange={onChange}
          errors={errors}
        />
      ))}
    </div>
  );
}

function FieldView(props: FieldProps) {
  const { field } = props;
  switch (field.type) {
    case "text":
    case "textarea":
      return <TextField {...props} field={field} />;
    case "image":
      return <ImageField {...props} field={field} />;
    case "youtube":
      return <YouTubeField {...props} field={field} />;
    case "select":
      return <SelectField {...props} field={field} />;
    case "list":
      return <ListField {...props} field={field} />;
    case "record":
      return <RecordField {...props} field={field} />;
  }
}

function TextField({ field, value, path, onChange, errors }: FieldProps<Extract<Field, { type: "text" | "textarea" }>>) {
  const id = domId(path);
  const error = errors[pathKey(path)];
  return (
    <Labeled id={id} label={field.label} help={field.help} error={error}>
      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={field.rows ?? 3}
          value={value ?? ""}
          onChange={(event) => onChange(path, event.target.value)}
          className={`${inputClass(error)} resize-y leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          value={value ?? ""}
          onChange={(event) => onChange(path, event.target.value)}
          className={inputClass(error)}
        />
      )}
    </Labeled>
  );
}

function SelectField({ field, value, path, onChange, errors }: FieldProps<Extract<Field, { type: "select" }>>) {
  const id = domId(path);
  const error = errors[pathKey(path)];
  return (
    <Labeled id={id} label={field.label} error={error}>
      <select
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange(path, event.target.value)}
        className={inputClass(error)}
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Labeled>
  );
}

function ImageField({ field, value, path, onChange, errors }: FieldProps<Extract<Field, { type: "image" }>>) {
  const [processing, setProcessing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);

  const src: string = value?.src ?? "";
  const isNew = src.startsWith("data:");
  const fileId = domId([...path, "file"]);
  const altId = domId([...path, "alt"]);
  const srcError = errors[pathKey([...path, "src"])];
  const altError = errors[pathKey([...path, "alt"])];

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setUploadError("");
    setProcessing(true);
    try {
      onChange([...path, "src"], await compressImage(file));
    } catch {
      setUploadError("Não foi possível ler esta imagem. Tente outro arquivo (JPG, PNG ou WebP).");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold text-primary">{field.label}</p>
      {field.help && <p className="mt-0.5 text-xs text-primary/55">{field.help}</p>}

      <div className="mt-3 flex flex-col gap-5 sm:flex-row">
        <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-primary/5 ring-1 ring-primary/10 sm:w-44">
          {src && brokenSrc !== src ? (
            <img src={src} alt="" className="h-full w-full object-cover" onError={() => setBrokenSrc(src)} />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-xs leading-relaxed text-primary/50">
              {src ? "Imagem salva — a prévia aparece aqui depois que o site for atualizado." : "Sem imagem"}
            </div>
          )}
          {isNew && (
            <span className="absolute top-2 left-2 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-primary-dark uppercase">
              Nova · não salva
            </span>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label
              htmlFor={fileId}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-accent hover:bg-accent/10"
            >
              {processing ? "Otimizando imagem…" : "Trocar imagem"}
            </label>
            <input
              id={fileId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={processing}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                void pick(file);
              }}
            />
            <p className="mt-2 text-xs text-primary/50">
              JPG, PNG ou WebP. A imagem é redimensionada e otimizada automaticamente.
            </p>
            {(uploadError || srcError) && (
              <p className="mt-1.5 text-xs font-medium text-red-700">{uploadError || srcError}</p>
            )}
          </div>

          <Labeled
            id={altId}
            label="Descrição da imagem"
            help="Lida por leitores de tela e usada pelo Google."
            error={altError}
          >
            <input
              id={altId}
              value={value?.alt ?? ""}
              onChange={(event) => onChange([...path, "alt"], event.target.value)}
              className={inputClass(altError)}
            />
          </Labeled>
        </div>
      </div>
    </div>
  );
}

function YouTubeField({ field, value, path, onChange, errors }: FieldProps<Extract<Field, { type: "youtube" }>>) {
  const stored: string = value ?? "";
  const [text, setText] = useState(stored);

  // Re-sync when the stored value changes from outside (discard, reorder).
  useEffect(() => {
    if ((parseYouTubeId(text) ?? text.trim()) !== stored) setText(stored);
  }, [stored]);

  const id = domId(path);
  const youtubeId = parseYouTubeId(text);
  const typedInvalid = text.trim() !== "" && !youtubeId;
  const error = typedInvalid
    ? "Link do YouTube não reconhecido."
    : errors[pathKey(path)];

  return (
    <Labeled id={id} label={field.label} help={field.help} error={error}>
      <input
        id={id}
        value={text}
        placeholder="https://youtube.com/shorts/…"
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          onChange(path, parseYouTubeId(next) ?? next.trim());
        }}
        className={inputClass(error)}
      />
      {youtubeId && (
        <div className="mt-3 flex items-center gap-3">
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`}
            alt=""
            className="h-14 w-24 rounded-lg object-cover ring-1 ring-primary/10"
          />
          <a
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-accent-dark hover:text-primary"
          >
            Conferir no YouTube ↗
          </a>
        </div>
      )}
    </Labeled>
  );
}

function ListField({ field, value, path, onChange, errors }: FieldProps<Extract<Field, { type: "list" }>>) {
  const items: any[] = Array.isArray(value) ? value : [];
  const editable = !!field.newItem;
  const listError = errors[pathKey(path)];

  const move = (from: number, to: number) => {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(path, next);
  };

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-primary">{field.label}</legend>
      {field.help && <p className="mt-0.5 text-xs text-primary/55">{field.help}</p>}
      {listError && <p className="mt-1.5 text-xs font-medium text-red-700">{listError}</p>}

      <div className="mt-3 space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl border border-primary/10 bg-cream/50 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="truncate text-xs font-bold tracking-[0.15em] text-accent-dark uppercase">
                {field.itemTitle(item, index)}
              </p>
              {editable && (
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    aria-label="Mover para cima"
                    className={smallButton}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Mover para baixo"
                    className={smallButton}
                    disabled={index === items.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label="Remover"
                    className={`${smallButton} hover:!bg-red-50 hover:!text-red-700`}
                    onClick={() => {
                      if (confirm("Remover este item?")) onChange(path, items.filter((_, i) => i !== index));
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <FieldList fields={field.fields} value={item} path={[...path, index]} onChange={onChange} errors={errors} />
          </div>
        ))}

        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-primary/20 p-6 text-center text-sm text-primary/50">
            Nenhum item ainda.
          </p>
        )}
      </div>

      {editable && (
        <button
          type="button"
          onClick={() => onChange(path, [...items, field.newItem!()])}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-primary/30 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-accent hover:bg-accent/10"
        >
          <span aria-hidden="true">+</span> {field.addLabel ?? "Adicionar"}
        </button>
      )}
    </fieldset>
  );
}

function RecordField({ field, value, path, onChange, errors }: FieldProps<Extract<Field, { type: "record" }>>) {
  const keys = Object.keys(value ?? {});
  const [active, setActive] = useState(keys[0]);
  const hasErrors = (key: string) =>
    Object.keys(errors).some((errorPath) => errorPath.startsWith(`${pathKey([...path, key])}.`));

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-primary">{field.label}</legend>
      <div role="tablist" className="mt-3 flex flex-wrap gap-2">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={key === active}
            onClick={() => setActive(key)}
            className={[
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              key === active
                ? "bg-primary text-cream"
                : "border border-primary/15 bg-white text-primary/75 hover:border-accent hover:text-primary",
            ].join(" ")}
          >
            {field.itemTitle(value[key])}
            {hasErrors(key) && <span className="h-2 w-2 rounded-full bg-red-500" aria-label="com erros" />}
          </button>
        ))}
      </div>

      {active && (
        <div role="tabpanel" className="mt-4 rounded-2xl border border-primary/10 bg-cream/50 p-5 sm:p-6">
          <FieldList fields={field.fields} value={value[active]} path={[...path, active]} onChange={onChange} errors={errors} />
        </div>
      )}
    </fieldset>
  );
}
