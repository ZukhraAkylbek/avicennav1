import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSiteRefresh } from "@/lib/admin-refresh";
import { BlocksEditor } from "@/components/admin/BlocksEditor";
import { parseBlocks, type PageBlock } from "@/lib/page-blocks";

export const Route = createFileRoute("/_authenticated/admin/pages")({
  head: () => ({
    meta: [
      { title: "Страницы сайта — админка Avicenna" },
      {
        name: "description",
        content: "Конструктор страниц и подстраниц сайта клиники «Авиценна».",
      },
      { property: "og:title", content: "Страницы сайта — админка Avicenna" },
      {
        property: "og:description",
        content: "Создание страниц, категорий и настройка шрифтов сайта.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPages,
});

const FONTS = ["Montserrat", "Manrope", "Inter", "Rubik", "Nunito", "PT Sans"];

type PageRow = {
  id: string;
  parent_id: string | null;
  slug: string;
  path: string;
  title: string;
  h1_title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  body: string | null;
  blocks: unknown;
  sort_order: number;
  is_published: boolean;
};

const SELECT =
  "id, parent_id, slug, path, title, h1_title, meta_title, meta_description, body, blocks, sort_order, is_published";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё-]+/gi, "-")
    .replace(/^-+|-+$/g, "");

function AdminPages() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");

  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async (): Promise<PageRow[]> => {
      const { data, error } = await supabase
        .from("pages")
        .select(SELECT)
        .order("path", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("id, heading_font, body_font, font_scale")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const refreshSite = useSiteRefresh();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
    void refreshSite();
  };

  const create = useMutation({
    mutationFn: async () => {
      const finalSlug = slugify(slug || title);
      if (!title.trim() || !finalSlug) throw new Error("Укажите название страницы");
      const parent = pages?.find((p) => p.id === parentId);
      const path = `${parent ? parent.path : ""}/${finalSlug}`;
      const { error } = await supabase.from("pages").insert({
        parent_id: parent?.id ?? null,
        slug: finalSlug,
        path,
        title: title.trim(),
        sort_order: (pages?.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Страница создана");
      setTitle("");
      setSlug("");
      setParentId("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<PageRow> }) => {
      const { error } = await supabase.from("pages").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Страница удалена");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveSettings = useMutation({
    mutationFn: async (values: {
      heading_font?: string;
      body_font?: string;
      font_scale?: number;
    }) => {
      if (!settings?.id) throw new Error("Настройки не найдены");
      const { error } = await supabase.from("site_settings").update(values).eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Настройки сохранены");
      void queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="bg-background min-h-screen">
      <Toaster />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-foreground text-3xl font-extrabold">Страницы сайта</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Создавайте страницы и подстраницы, редактируйте текст, заголовки и SEO.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/hero">Слайды баннера</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/content">Тексты и картинки</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">На сайт</Link>
            </Button>
          </div>
        </div>

        <section className="border-border mt-8 rounded-xl border p-6">
          <h2 className="text-foreground text-xl font-extrabold">Типографика сайта</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-sm">Шрифт заголовков</Label>
              <select
                className="border-input bg-background mt-2 h-10 w-full rounded-md border px-3 text-sm"
                value={settings?.heading_font ?? "Montserrat"}
                onChange={(e) => saveSettings.mutate({ heading_font: e.target.value })}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm">Шрифт текста</Label>
              <select
                className="border-input bg-background mt-2 h-10 w-full rounded-md border px-3 text-sm"
                value={settings?.body_font ?? "Manrope"}
                onChange={(e) => saveSettings.mutate({ body_font: e.target.value })}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="scale" className="text-sm">
                Масштаб текста (%)
              </Label>
              <Input
                id="scale"
                type="number"
                min={80}
                max={140}
                step={5}
                className="mt-2"
                defaultValue={Math.round(Number(settings?.font_scale ?? 1) * 100)}
                onBlur={(e) =>
                  saveSettings.mutate({
                    font_scale: Math.min(1.4, Math.max(0.8, (Number(e.target.value) || 100) / 100)),
                  })
                }
              />
            </div>
          </div>
        </section>

        <section className="border-border mt-8 rounded-xl border border-dashed p-6">
          <h2 className="text-foreground text-xl font-extrabold">Новая страница</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="new-title" className="text-sm">
                Название
              </Label>
              <Input
                id="new-title"
                className="mt-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Чекапы"
              />
            </div>
            <div>
              <Label htmlFor="new-slug" className="text-sm">
                Адрес (латиницей)
              </Label>
              <Input
                id="new-slug"
                className="mt-2"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="checkup"
              />
            </div>
            <div>
              <Label htmlFor="new-parent" className="text-sm">
                Родительская страница
              </Label>
              <select
                id="new-parent"
                className="border-input bg-background mt-2 h-10 w-full rounded-md border px-3 text-sm"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">— верхний уровень —</option>
                {pages?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.path}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button className="mt-4" onClick={() => create.mutate()} disabled={create.isPending}>
            Создать страницу
          </Button>
        </section>

        <div className="mt-8 space-y-4">
          {isLoading && <p className="text-muted-foreground text-sm">Загрузка…</p>}
          {pages?.length === 0 && (
            <p className="text-muted-foreground text-sm">Страниц пока нет.</p>
          )}
          {pages?.map((page) => (
            <details key={page.id} className="border-border rounded-xl border p-5">
              <summary className="cursor-pointer text-lg font-bold">
                {page.title}
                <span className="text-muted-foreground ml-2 text-sm font-normal">{page.path}</span>
              </summary>
              <div className="mt-4 space-y-3">
                <Input
                  defaultValue={page.title}
                  placeholder="Название"
                  onBlur={(e) => update.mutate({ id: page.id, values: { title: e.target.value } })}
                />
                <Input
                  defaultValue={page.h1_title ?? ""}
                  placeholder="Заголовок H1"
                  onBlur={(e) =>
                    update.mutate({ id: page.id, values: { h1_title: e.target.value } })
                  }
                />
                <Input
                  defaultValue={page.meta_title ?? ""}
                  placeholder="SEO title"
                  onBlur={(e) =>
                    update.mutate({ id: page.id, values: { meta_title: e.target.value } })
                  }
                />
                <Input
                  defaultValue={page.meta_description ?? ""}
                  placeholder="SEO description"
                  onBlur={(e) =>
                    update.mutate({ id: page.id, values: { meta_description: e.target.value } })
                  }
                />
                <Textarea
                  rows={8}
                  defaultValue={page.body ?? ""}
                  placeholder="Текст страницы (абзацы разделяйте пустой строкой)"
                  onBlur={(e) => update.mutate({ id: page.id, values: { body: e.target.value } })}
                />
                <PageBlocksPanel
                  page={page}
                  onSave={(blocks) =>
                    update.mutate({ id: page.id, values: { blocks } as Partial<PageRow> })
                  }
                />
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`order-${page.id}`} className="text-sm">
                      Порядок
                    </Label>
                    <Input
                      id={`order-${page.id}`}
                      type="number"
                      className="w-20"
                      defaultValue={page.sort_order}
                      onBlur={(e) =>
                        update.mutate({
                          id: page.id,
                          values: { sort_order: Number(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`pub-${page.id}`}
                      checked={page.is_published}
                      onCheckedChange={(checked) =>
                        update.mutate({ id: page.id, values: { is_published: checked } })
                      }
                    />
                    <Label htmlFor={`pub-${page.id}`} className="text-sm">
                      Опубликована
                    </Label>
                  </div>
                  <a
                    href={page.path}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-sm font-semibold"
                  >
                    Открыть страницу
                  </a>
                  <Button
                    variant="ghost"
                    className="text-brand-terracotta ml-auto"
                    onClick={() => remove.mutate(page.id)}
                  >
                    <Trash2 className="mr-2 size-4" aria-hidden="true" />
                    Удалить
                  </Button>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Конструктор блоков конкретной страницы. */
function PageBlocksPanel({
  page,
  onSave,
}: {
  page: PageRow;
  onSave: (blocks: PageBlock[]) => void;
}) {
  const [blocks, setBlocks] = useState<PageBlock[]>(() => parseBlocks(page.blocks));

  return (
    <div className="border-border mt-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-foreground text-lg font-extrabold">Блоки страницы</h3>
          <p className="text-muted-foreground text-sm">
            Hero, текст, таймлайн, цифры, карточки, вопросы-ответы, филиалы, миссия и оффер.
          </p>
        </div>
        <Button
          onClick={() => {
            onSave(blocks);
            toast.success("Блоки сохранены");
          }}
        >
          Сохранить блоки
        </Button>
      </div>
      <div className="mt-4">
        <BlocksEditor blocks={blocks} onChange={setBlocks} />
      </div>
    </div>
  );
}
