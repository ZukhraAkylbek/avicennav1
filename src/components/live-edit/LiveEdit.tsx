import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Type, X, Eye, Save } from "lucide-react";


import { supabase } from "@/integrations/supabase/client";
import {
  fetchSiteContent,
  styleToCss,
  type ElementStyle,
  type SiteContentMap,
} from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { useSiteRefresh } from "@/lib/admin-refresh";

const FONTS = [
  { label: "Как на сайте", value: "" },
  { label: "Gotham Pro / Segoe UI", value: '"Gotham Pro", "Segoe UI", sans-serif' },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Manrope", value: "Manrope, sans-serif" },
  { label: "Segoe UI", value: '"Segoe UI", sans-serif' },
  { label: "Georgia (с засечками)", value: "Georgia, serif" },
  { label: "Системный", value: "system-ui, sans-serif" },
];

const WEIGHTS = [300, 400, 500, 600, 700, 800, 900];

type Selection = { key: string; label: string; text: string; multiline: boolean };

type LiveEditCtx = {
  isAdmin: boolean;
  editing: boolean;
  setEditing: (v: boolean) => void;
  selected: Selection | null;
  select: (s: Selection | null) => void;
  content: SiteContentMap | undefined;
  save: (key: string, patch: { value?: string; style_json?: ElementStyle | null }) => Promise<void>;
};

const Ctx = createContext<LiveEditCtx | null>(null);

export function useLiveEdit() {
  return useContext(Ctx);
}

export function LiveEditProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const refreshSite = useSiteRefresh();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Selection | null>(null);

  const { data: content } = useQuery({
    queryKey: ["site-content"],
    queryFn: fetchSiteContent,
    staleTime: 60_000,
  });

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setIsAdmin(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAdmin(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const save = useCallback(
    async (key: string, patch: { value?: string; style_json?: ElementStyle | null }) => {
      // Оптимистично обновляем превью, чтобы правки были видны сразу.
      queryClient.setQueryData<SiteContentMap>(["site-content"], (prev) => {
        const current = prev?.[key] ?? { value: null, url: null, style: null };
        return {
          ...(prev ?? {}),
          [key]: {
            ...current,
            value: patch.value !== undefined ? patch.value : current.value,
            style: patch.style_json !== undefined ? patch.style_json : current.style,
          },
        };
      });

      const { error } = await supabase
        .from("site_content")
        .upsert({ key, ...patch, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      await refreshSite();
    },
    [queryClient, refreshSite],
  );

  const value = useMemo<LiveEditCtx>(
    () => ({
      isAdmin,
      editing,
      setEditing: (v) => {
        setEditing(v);
        if (!v) setSelected(null);
      },
      selected,
      select: setSelected,
      content,
      save,
    }),
    [isAdmin, editing, selected, content, save],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {isAdmin && <EditModeToggle />}
      {isAdmin && editing && selected && <StyleToolbar />}
    </Ctx.Provider>
  );
}

function EditModeToggle() {
  const ctx = useLiveEdit()!;
  return (
    <button
      type="button"
      onClick={() => ctx.setEditing(!ctx.editing)}
      className="bg-brand-green text-brand-white fixed bottom-5 left-5 z-[70] inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5"
    >
      {ctx.editing ? <Eye className="size-4" /> : <Pencil className="size-4" />}
      {ctx.editing ? "Выйти из редактирования" : "Режим редактирования"}
    </button>
  );
}

/** Панель настроек выбранного элемента: текст, шрифт, размер, цвет. */
function StyleToolbar() {
  const ctx = useLiveEdit()!;
  const sel = ctx.selected!;
  const saved = ctx.content?.[sel.key]?.style ?? {};
  const [text, setText] = useState(sel.text);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => setText(sel.text), [sel.key, sel.text]);

  const patchStyle = (patch: Record<string, unknown>) => {
    const next = { ...saved, ...patch } as Record<string, unknown>;
    for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k];
    void ctx.save(sel.key, { style_json: next as ElementStyle }).then(() => setStatus("Сохранено"));
  };

  const saveText = () => {
    void ctx.save(sel.key, { value: text }).then(() => setStatus("Сохранено"));
  };

  return (
    <div className="border-border bg-background fixed inset-x-0 bottom-0 z-[80] border-t shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
      <div className="mx-auto max-h-[60vh] max-w-5xl overflow-y-auto px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-brand-green flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
              <Type className="size-3.5" /> {sel.label}
            </p>
            <p className="text-muted-foreground truncate text-xs">{sel.key}</p>
          </div>
          <div className="flex items-center gap-2">
            {status && <span className="text-brand-green text-xs font-semibold">{status}</span>}
            <button
              type="button"
              aria-label="Закрыть панель"
              onClick={() => ctx.select(null)}
              className="border-border grid size-9 place-items-center rounded-md border"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <label className="text-foreground text-xs font-semibold">Текст</label>
            {sel.multiline ? (
              <textarea
                value={text}
                rows={3}
                onChange={(e) => setText(e.target.value)}
                onBlur={saveText}
                className="border-border bg-background mt-2 w-full rounded-lg border px-3 py-2 text-sm"
              />
            ) : (
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={saveText}
                className="border-border bg-background mt-2 w-full rounded-lg border px-3 py-2 text-sm"
              />
            )}
            <button
              type="button"
              onClick={saveText}
              className="bg-brand-green text-brand-white mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"
            >
              <Save className="size-3.5" /> Сохранить текст
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Шрифт" className="col-span-2">
              <select
                value={saved.fontFamily ?? ""}
                onChange={(e) => patchStyle({ fontFamily: e.target.value || undefined })}
                className="border-border bg-background w-full rounded-lg border px-2 py-2 text-sm"
              >
                {FONTS.map((f) => (
                  <option key={f.label} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={`Размер${saved.fontSize ? `: ${saved.fontSize}px` : ""}`}>
              <input
                type="range"
                min={10}
                max={96}
                value={saved.fontSize ?? 20}
                onChange={(e) => patchStyle({ fontSize: Number(e.target.value) })}
                className="w-full"
              />
            </Field>

            <Field label="Насыщенность">
              <select
                value={saved.fontWeight ?? ""}
                onChange={(e) =>
                  patchStyle({ fontWeight: e.target.value ? Number(e.target.value) : undefined })
                }
                className="border-border bg-background w-full rounded-lg border px-2 py-2 text-sm"
              >
                <option value="">Как на сайте</option>
                {WEIGHTS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Цвет">
              <input
                type="color"
                value={saved.color ?? "#000000"}
                onChange={(e) => patchStyle({ color: e.target.value })}
                className="border-border h-10 w-full rounded-lg border"
              />
            </Field>

            <Field label="Выравнивание">
              <select
                value={saved.textAlign ?? ""}
                onChange={(e) =>
                  patchStyle({
                    textAlign: (e.target.value || undefined) as ElementStyle["textAlign"],
                  })
                }
                className="border-border bg-background w-full rounded-lg border px-2 py-2 text-sm"
              >
                <option value="">Как на сайте</option>
                <option value="left">Слева</option>
                <option value="center">По центру</option>
                <option value="right">Справа</option>
              </select>
            </Field>

            <Field label="Регистр">
              <select
                value={saved.textTransform ?? ""}
                onChange={(e) =>
                  patchStyle({
                    textTransform: (e.target.value || undefined) as ElementStyle["textTransform"],
                  })
                }
                className="border-border bg-background w-full rounded-lg border px-2 py-2 text-sm"
              >
                <option value="">Как на сайте</option>
                <option value="none">Обычный</option>
                <option value="uppercase">ЗАГЛАВНЫЕ</option>
              </select>
            </Field>

            <Field label="Межбуквенное">
              <input
                type="range"
                min={-2}
                max={6}
                step={0.5}
                value={saved.letterSpacing ?? 0}
                onChange={(e) => patchStyle({ letterSpacing: Number(e.target.value) })}
                className="w-full"
              />
            </Field>

            <button
              type="button"
              onClick={() => void ctx.save(sel.key, { style_json: null })}
              className="border-border col-span-2 rounded-lg border px-3 py-2 text-xs font-semibold"
            >
              Сбросить оформление
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-muted-foreground text-xs font-semibold">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

type EditableProps = {
  /** Ключ контента, например hero.title */
  ekey: string;
  /** Человеческое название для панели редактирования */
  label: string;
  /** Значение из кода, если в базе ничего нет */
  fallback?: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  children?: ReactNode;
};

/**
 * Любой текст сайта: обычным посетителям — просто текст с сохранённым оформлением,
 * админу в режиме редактирования — кликабельный элемент с подсветкой.
 */
export function Editable({
  ekey,
  label,
  fallback = "",
  as,
  className,
  multiline = false,
  children,
}: EditableProps) {
  const ctx = useLiveEdit();
  const Tag = (as ?? "span") as ElementType;
  // Никаких клиентских ветвлений: и на сервере, и при гидратации берём одни и те же данные
  // из кэша запроса (он передаётся с SSR), иначе текст не совпадает и React ругается.
  const row = ctx?.content?.[ekey];
  const text = row?.value && row.value.trim().length > 0 ? row.value : fallback;
  const style = styleToCss(row?.style);
  const active = Boolean(ctx?.isAdmin && ctx?.editing);
  const isSelected = ctx?.selected?.key === ekey;


  return (
    <Tag
      style={style}
      className={cn(
        className,
        active &&
          "cursor-text rounded outline-2 outline-offset-2 outline-transparent transition-[outline-color] hover:outline-[color:var(--brand-green,#0F9247)]",
        active && isSelected && "outline-[color:var(--brand-green,#0F9247)]",
      )}
      {...(active
        ? {
            "data-live-edit": ekey,
            title: `Редактировать: ${label}`,
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              ctx?.select({ key: ekey, label, text, multiline });
            },
          }
        : {})}
    >
      {children ?? text}
    </Tag>
  );
}
