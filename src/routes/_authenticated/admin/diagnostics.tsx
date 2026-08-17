import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GripVertical, Plus, Trash2, Upload } from "lucide-react";

import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { DiagnosticsIcon } from "@/components/DiagnosticsIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { SITE_IMAGES_BUCKET } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/diagnostics")({
  head: () => ({
    meta: [
      { title: "Диагностика — админка Avicenna" },
      {
        name: "description",
        content:
          "Конструктор страницы «Диагностика»: блоки, навигатор по симптомам, категории и 24 подстраницы исследований.",
      },
      { property: "og:title", content: "Диагностика — админка Avicenna" },
      {
        property: "og:description",
        content: "Управление блоками, симптомами, категориями и карточками исследований.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDiagnostics,
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё-]+/gi, "-")
    .replace(/^-+|-+$/g, "");

type SectionRow = {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  primary_label: string | null;
  primary_url: string | null;
  secondary_label: string | null;
  secondary_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type CategoryRow = {
  id: string;
  key: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

type SymptomRow = {
  id: string;
  name: string;
  recommendation: string;
  sort_order: number;
  is_active: boolean;
};

type ItemRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category_key: string | null;
  icon: string | null;
  image_url: string | null;
  price: string | null;
  badge: string | null;
  body: string | null;
  includes: string | null;
  preparation: string | null;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number;
  is_active: boolean;
};

const SECTION_SELECT =
  "id, key, title, subtitle, body, image_url, primary_label, primary_url, secondary_label, secondary_url, sort_order, is_active";
const CATEGORY_SELECT = "id, key, name, sort_order, is_active";
const SYMPTOM_SELECT = "id, name, recommendation, sort_order, is_active";
const ITEM_SELECT =
  "id, slug, title, subtitle, category_key, icon, image_url, price, badge, body, includes, preparation, meta_title, meta_description, sort_order, is_active";

const ICON_HINT = "Имя иконки lucide: Scan, HeartPulse, Waves, TestTube, Bone, Wind, Microscope…";

function AdminDiagnostics() {
  const queryClient = useQueryClient();
  const [sectionDraft, setSectionDraft] = useState<Partial<SectionRow> | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<Partial<CategoryRow> | null>(null);
  const [symptomDraft, setSymptomDraft] = useState<Partial<SymptomRow> | null>(null);
  const [itemDraft, setItemDraft] = useState<Partial<ItemRow> | null>(null);
  const [order, setOrder] = useState<SectionRow[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const itemFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-diagnostics"] });
    void queryClient.invalidateQueries({ queryKey: ["diagnostics"] });
  };

  const { data: sections } = useQuery({
    queryKey: ["admin-diagnostics", "sections"],
    queryFn: async (): Promise<SectionRow[]> => {
      const { data, error } = await supabase
        .from("diagnostics_sections")
        .select(SECTION_SELECT)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-diagnostics", "categories"],
    queryFn: async (): Promise<CategoryRow[]> => {
      const { data, error } = await supabase
        .from("diagnostics_categories")
        .select(CATEGORY_SELECT)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: symptoms } = useQuery({
    queryKey: ["admin-diagnostics", "symptoms"],
    queryFn: async (): Promise<SymptomRow[]> => {
      const { data, error } = await supabase
        .from("diagnostics_symptoms")
        .select(SYMPTOM_SELECT)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: items } = useQuery({
    queryKey: ["admin-diagnostics", "items"],
    queryFn: async (): Promise<ItemRow[]> => {
      const { data, error } = await supabase
        .from("diagnostics_items")
        .select(ITEM_SELECT)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (sections) setOrder(sections);
  }, [sections]);

  const persistOrder = useMutation({
    mutationFn: async (rows: SectionRow[]) => {
      await Promise.all(
        rows.map((row, index) =>
          supabase
            .from("diagnostics_sections")
            .update({ sort_order: index + 1 })
            .eq("id", row.id),
        ),
      );
    },
    onSuccess: () => {
      toast.success("Порядок блоков сохранён");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleSection = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("diagnostics_sections")
        .update({ is_active })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const saveSection = useMutation({
    mutationFn: async (values: Partial<SectionRow>) => {
      const payload = {
        key: values.key?.trim() || slugify(values.title ?? "") || `block-${Date.now()}`,
        title: (values.title ?? "").trim(),
        subtitle: values.subtitle ?? null,
        body: values.body ?? null,
        image_url: values.image_url ?? null,
        primary_label: values.primary_label ?? null,
        primary_url: values.primary_url ?? null,
        secondary_label: values.secondary_label ?? null,
        secondary_url: values.secondary_url ?? null,
        is_active: values.is_active ?? true,
        sort_order: values.sort_order ?? order.length + 1,
      };
      if (!payload.title) throw new Error("Укажите название блока");
      if (values.id) {
        const { error } = await supabase
          .from("diagnostics_sections")
          .update(payload)
          .eq("id", values.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("diagnostics_sections").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Блок сохранён");
      setSectionDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diagnostics_sections").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Блок удалён");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveCategory = useMutation({
    mutationFn: async (values: Partial<CategoryRow>) => {
      const payload = {
        key: values.key?.trim() || slugify(values.name ?? "") || `cat-${Date.now()}`,
        name: (values.name ?? "").trim(),
        is_active: values.is_active ?? true,
        sort_order: values.sort_order ?? (categories?.length ?? 0) + 1,
      };
      if (!payload.name) throw new Error("Укажите название категории");
      if (values.id) {
        const { error } = await supabase
          .from("diagnostics_categories")
          .update(payload)
          .eq("id", values.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("diagnostics_categories").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Категория сохранена");
      setCategoryDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diagnostics_categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Категория удалена");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveSymptom = useMutation({
    mutationFn: async (values: Partial<SymptomRow>) => {
      const payload = {
        name: (values.name ?? "").trim(),
        recommendation: (values.recommendation ?? "").trim(),
        is_active: values.is_active ?? true,
        sort_order: values.sort_order ?? (symptoms?.length ?? 0) + 1,
      };
      if (!payload.name) throw new Error("Укажите симптом");
      if (!payload.recommendation) throw new Error("Укажите рекомендацию");
      if (values.id) {
        const { error } = await supabase
          .from("diagnostics_symptoms")
          .update(payload)
          .eq("id", values.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("diagnostics_symptoms").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Симптом сохранён");
      setSymptomDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeSymptom = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diagnostics_symptoms").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Симптом удалён");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveItem = useMutation({
    mutationFn: async (values: Partial<ItemRow>) => {
      const payload = {
        slug: values.slug?.trim() || slugify(values.title ?? "") || `issledovanie-${Date.now()}`,
        title: (values.title ?? "").trim(),
        subtitle: values.subtitle ?? null,
        category_key: values.category_key || null,
        icon: values.icon ?? null,
        image_url: values.image_url ?? null,
        price: values.price ?? null,
        badge: values.badge ?? null,
        body: values.body ?? null,
        includes: values.includes ?? null,
        preparation: values.preparation ?? null,
        meta_title: values.meta_title ?? null,
        meta_description: values.meta_description ?? null,
        is_active: values.is_active ?? true,
        sort_order: values.sort_order ?? (items?.length ?? 0) + 1,
      };
      if (!payload.title) throw new Error("Укажите название исследования");
      if (values.id) {
        const { error } = await supabase
          .from("diagnostics_items")
          .update(payload)
          .eq("id", values.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("diagnostics_items").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Исследование сохранено");
      setItemDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diagnostics_items").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Исследование удалено");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveItem = useMutation({
    mutationFn: async ({ id, sort_order }: { id: string; sort_order: number }) => {
      const { error } = await supabase
        .from("diagnostics_items")
        .update({ sort_order })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  async function uploadImage(file: File, target: "item" | "hero") {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `diagnostics/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from(SITE_IMAGES_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw new Error(error.message);
      const { data, error: signError } = await supabase.storage
        .from(SITE_IMAGES_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 3650);
      if (signError) throw new Error(signError.message);
      const url = data?.signedUrl ?? null;
      if (target === "item") setItemDraft((prev) => (prev ? { ...prev, image_url: url } : prev));
      else setSectionDraft((prev) => (prev ? { ...prev, image_url: url } : prev));
      toast.success("Изображение загружено");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (itemFileRef.current) itemFileRef.current.value = "";
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const next = [...order];
    const from = next.findIndex((r) => r.id === dragId);
    const to = next.findIndex((r) => r.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    setOrder(next);
    setDragId(null);
    persistOrder.mutate(next);
  }

  function swapItems(index: number, direction: -1 | 1) {
    if (!items) return;
    const a = items[index];
    const b = items[index + direction];
    if (!a || !b) return;
    moveItem.mutate({ id: a.id, sort_order: b.sort_order });
    moveItem.mutate({ id: b.id, sort_order: a.sort_order });
  }

  return (
    <>
      <PageHeader
        eyebrow="Раздел сайта"
        title="Диагностика"
        description="Структура страницы, навигатор по симптомам, категории и подстраницы исследований — всё редактируется здесь."
        actions={
          <>
            <Button
              variant="outline"
              className="border-admin-line h-11 rounded-xl"
              onClick={() => setSectionDraft({ is_active: true })}
            >
              <Plus className="mr-1.5 size-4" /> Блок
            </Button>
            <Button
              className="bg-admin-blue hover:bg-admin-blue/90 h-11 rounded-xl font-semibold text-white"
              onClick={() => setItemDraft({ is_active: true })}
            >
              <Plus className="mr-1.5 size-4" /> Исследование
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Структура страницы"
          description="Перетаскивайте блоки, чтобы изменить порядок. Переключатель скрывает блок на сайте."
        >
          <ul className="space-y-2">
            {order.map((row, index) => (
              <li
                key={row.id}
                draggable
                onDragStart={() => setDragId(row.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(row.id)}
                className={cn(
                  "border-admin-line bg-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-2.5",
                  dragId === row.id && "opacity-50",
                )}
              >
                <GripVertical className="text-admin-muted size-4 cursor-grab" />
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => setSectionDraft({ ...row })}
                >
                  <p className="truncate text-[15px] font-bold">
                    {index + 1}. {row.title}
                  </p>
                  <p className="text-admin-muted truncate text-[12px]">{row.key}</p>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <Switch
                    checked={row.is_active}
                    onCheckedChange={(v) => toggleSection.mutate({ id: row.id, is_active: v })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive rounded-xl"
                    aria-label="Удалить блок"
                    onClick={() => {
                      if (confirm("Удалить блок?")) removeSection.mutate(row.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Навигатор по симптомам"
          description="Симптом и рекомендация, которая показывается пациенту после выбора."
        >
          <Button
            variant="outline"
            className="border-admin-line mb-3 h-10 rounded-xl"
            onClick={() => setSymptomDraft({ is_active: true })}
          >
            <Plus className="mr-1.5 size-4" /> Симптом
          </Button>
          <ul className="space-y-2">
            {(symptoms ?? []).map((row) => (
              <li
                key={row.id}
                className="border-admin-line bg-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-2.5"
              >
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => setSymptomDraft({ ...row })}
                >
                  <p className="truncate text-[15px] font-bold">{row.name}</p>
                  <p className="text-admin-muted truncate text-[12px]">{row.recommendation}</p>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <Switch
                    checked={row.is_active}
                    onCheckedChange={(v) => saveSymptom.mutate({ ...row, is_active: v })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive rounded-xl"
                    aria-label="Удалить симптом"
                    onClick={() => {
                      if (confirm("Удалить симптом?")) removeSymptom.mutate(row.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Категории" description="Фильтры на странице диагностики.">
          <Button
            variant="outline"
            className="border-admin-line mb-3 h-10 rounded-xl"
            onClick={() => setCategoryDraft({ is_active: true })}
          >
            <Plus className="mr-1.5 size-4" /> Категория
          </Button>
          <ul className="space-y-2">
            {(categories ?? []).map((row) => (
              <li
                key={row.id}
                className="border-admin-line bg-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-2.5"
              >
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => setCategoryDraft({ ...row })}
                >
                  <p className="truncate text-[15px] font-bold">{row.name}</p>
                  <p className="text-admin-muted truncate text-[12px]">{row.key}</p>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <Switch
                    checked={row.is_active}
                    onCheckedChange={(v) => saveCategory.mutate({ ...row, is_active: v })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive rounded-xl"
                    aria-label="Удалить категорию"
                    onClick={() => {
                      if (confirm("Удалить категорию?")) removeCategory.mutate(row.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={`Подстраницы исследований (${items?.length ?? 0})`}
          description="Каждое исследование — отдельная страница /diagnostika/slug с иконкой или фото, ценой и SEO."
        >
          <ul className="space-y-2">
            {(items ?? []).map((row, index) => (
              <li
                key={row.id}
                className="border-admin-line bg-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-2.5"
              >
                <DiagnosticsIcon
                  icon={row.icon}
                  imageUrl={row.image_url}
                  title={row.title}
                  className="size-10 rounded-xl"
                />
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => setItemDraft({ ...row })}
                >
                  <p className="truncate text-[15px] font-bold">{row.title}</p>
                  <p className="text-admin-muted truncate text-[12px]">
                    /diagnostika/{row.slug} · {row.price ?? "цена не указана"}
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    aria-label="Выше"
                    disabled={index === 0}
                    onClick={() => swapItems(index, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    aria-label="Ниже"
                    disabled={index === (items?.length ?? 0) - 1}
                    onClick={() => swapItems(index, 1)}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive rounded-xl"
                    aria-label="Удалить"
                    onClick={() => {
                      if (confirm("Удалить исследование?")) removeItem.mutate(row.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Блок страницы */}
      <Sheet open={sectionDraft !== null} onOpenChange={(open) => !open && setSectionDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{sectionDraft?.id ? "Блок страницы" : "Новый блок"}</SheetTitle>
            <SheetDescription>Заголовок, текст, фото и кнопки блока.</SheetDescription>
          </SheetHeader>
          {sectionDraft && (
            <form
              className="space-y-4 px-4 pb-8"
              onSubmit={(e) => {
                e.preventDefault();
                saveSection.mutate(sectionDraft);
              }}
            >
              <Field label="Заголовок">
                <Input
                  value={sectionDraft.title ?? ""}
                  onChange={(e) => setSectionDraft({ ...sectionDraft, title: e.target.value })}
                  className="border-admin-line h-11 rounded-xl"
                />
              </Field>
              <Field label="Ключ блока" hint="hero, navigator, catalog, advantages, cta">
                <Input
                  value={sectionDraft.key ?? ""}
                  onChange={(e) => setSectionDraft({ ...sectionDraft, key: e.target.value })}
                  className="border-admin-line h-11 rounded-xl"
                />
              </Field>
              <Field label="Подзаголовок">
                <Textarea
                  rows={3}
                  value={sectionDraft.subtitle ?? ""}
                  onChange={(e) => setSectionDraft({ ...sectionDraft, subtitle: e.target.value })}
                  className="border-admin-line rounded-xl"
                />
              </Field>
              <Field label="Дополнительный текст / сноска">
                <Textarea
                  rows={3}
                  value={sectionDraft.body ?? ""}
                  onChange={(e) => setSectionDraft({ ...sectionDraft, body: e.target.value })}
                  className="border-admin-line rounded-xl"
                />
              </Field>
              <Field label="Изображение блока">
                <div className="flex items-center gap-3">
                  {sectionDraft.image_url && (
                    <img
                      src={sectionDraft.image_url}
                      alt=""
                      className="border-admin-line size-16 rounded-xl border object-cover"
                    />
                  )}
                  <input
                    ref={heroFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadImage(file, "hero");
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-admin-line h-10 rounded-xl"
                    disabled={uploading}
                    onClick={() => heroFileRef.current?.click()}
                  >
                    <Upload className="mr-1.5 size-4" /> Загрузить
                  </Button>
                  {sectionDraft.image_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive h-10 rounded-xl"
                      onClick={() => setSectionDraft({ ...sectionDraft, image_url: null })}
                    >
                      Убрать
                    </Button>
                  )}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Основная кнопка">
                  <Input
                    value={sectionDraft.primary_label ?? ""}
                    onChange={(e) =>
                      setSectionDraft({ ...sectionDraft, primary_label: e.target.value })
                    }
                    className="border-admin-line h-11 rounded-xl"
                  />
                </Field>
                <Field label="Ссылка">
                  <Input
                    value={sectionDraft.primary_url ?? ""}
                    onChange={(e) =>
                      setSectionDraft({ ...sectionDraft, primary_url: e.target.value })
                    }
                    className="border-admin-line h-11 rounded-xl"
                  />
                </Field>
                <Field label="Второстепенная кнопка">
                  <Input
                    value={sectionDraft.secondary_label ?? ""}
                    onChange={(e) =>
                      setSectionDraft({ ...sectionDraft, secondary_label: e.target.value })
                    }
                    className="border-admin-line h-11 rounded-xl"
                  />
                </Field>
                <Field label="Ссылка">
                  <Input
                    value={sectionDraft.secondary_url ?? ""}
                    onChange={(e) =>
                      setSectionDraft({ ...sectionDraft, secondary_url: e.target.value })
                    }
                    className="border-admin-line h-11 rounded-xl"
                  />
                </Field>
              </div>
              <SubmitRow onCancel={() => setSectionDraft(null)} pending={saveSection.isPending} />
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Симптом */}
      <Sheet open={symptomDraft !== null} onOpenChange={(open) => !open && setSymptomDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{symptomDraft?.id ? "Симптом" : "Новый симптом"}</SheetTitle>
            <SheetDescription>
              Рекомендация продолжает фразу «По симптому „…“ …».
            </SheetDescription>
          </SheetHeader>
          {symptomDraft && (
            <form
              className="space-y-4 px-4 pb-8"
              onSubmit={(e) => {
                e.preventDefault();
                saveSymptom.mutate(symptomDraft);
              }}
            >
              <Field label="Симптом">
                <Input
                  value={symptomDraft.name ?? ""}
                  onChange={(e) => setSymptomDraft({ ...symptomDraft, name: e.target.value })}
                  className="border-admin-line h-11 rounded-xl"
                />
              </Field>
              <Field label="Рекомендация">
                <Textarea
                  rows={4}
                  value={symptomDraft.recommendation ?? ""}
                  onChange={(e) =>
                    setSymptomDraft({ ...symptomDraft, recommendation: e.target.value })
                  }
                  className="border-admin-line rounded-xl"
                />
              </Field>
              <SubmitRow onCancel={() => setSymptomDraft(null)} pending={saveSymptom.isPending} />
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Категория */}
      <Sheet open={categoryDraft !== null} onOpenChange={(open) => !open && setCategoryDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{categoryDraft?.id ? "Категория" : "Новая категория"}</SheetTitle>
            <SheetDescription>Название фильтра и его ключ.</SheetDescription>
          </SheetHeader>
          {categoryDraft && (
            <form
              className="space-y-4 px-4 pb-8"
              onSubmit={(e) => {
                e.preventDefault();
                saveCategory.mutate(categoryDraft);
              }}
            >
              <Field label="Название">
                <Input
                  value={categoryDraft.name ?? ""}
                  onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })}
                  className="border-admin-line h-11 rounded-xl"
                />
              </Field>
              <Field label="Ключ">
                <Input
                  value={categoryDraft.key ?? ""}
                  onChange={(e) => setCategoryDraft({ ...categoryDraft, key: e.target.value })}
                  className="border-admin-line h-11 rounded-xl"
                />
              </Field>
              <SubmitRow onCancel={() => setCategoryDraft(null)} pending={saveCategory.isPending} />
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Исследование */}
      <Sheet open={itemDraft !== null} onOpenChange={(open) => !open && setItemDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{itemDraft?.id ? "Исследование" : "Новое исследование"}</SheetTitle>
            <SheetDescription>Подстраница /diagnostika/slug со своим SEO.</SheetDescription>
          </SheetHeader>
          {itemDraft && (
            <form
              className="space-y-4 px-4 pb-8"
              onSubmit={(e) => {
                e.preventDefault();
                saveItem.mutate(itemDraft);
              }}
            >
              <Field label="Название">
                <Input
                  value={itemDraft.title ?? ""}
                  onChange={(e) => setItemDraft({ ...itemDraft, title: e.target.value })}
                  className="border-admin-line h-11 rounded-xl"
                />
              </Field>
              <Field label="Адрес (slug)" hint="Например: uzi-serdca">
                <Input
                  value={itemDraft.slug ?? ""}
                  onChange={(e) => setItemDraft({ ...itemDraft, slug: e.target.value })}
                  className="border-admin-line h-11 rounded-xl"
                />
              </Field>
              <Field label="Краткое описание (оффер)">
                <Textarea
                  rows={3}
                  value={itemDraft.subtitle ?? ""}
                  onChange={(e) => setItemDraft({ ...itemDraft, subtitle: e.target.value })}
                  className="border-admin-line rounded-xl"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Категория">
                  <select
                    value={itemDraft.category_key ?? ""}
                    onChange={(e) => setItemDraft({ ...itemDraft, category_key: e.target.value })}
                    className="border-admin-line bg-card h-11 w-full rounded-xl border px-3 text-sm"
                  >
                    <option value="">—</option>
                    {(categories ?? []).map((c) => (
                      <option key={c.id} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Цена">
                  <Input
                    value={itemDraft.price ?? ""}
                    onChange={(e) => setItemDraft({ ...itemDraft, price: e.target.value })}
                    className="border-admin-line h-11 rounded-xl"
                  />
                </Field>
                <Field label="Иконка" hint={ICON_HINT}>
                  <Input
                    value={itemDraft.icon ?? ""}
                    onChange={(e) => setItemDraft({ ...itemDraft, icon: e.target.value })}
                    className="border-admin-line h-11 rounded-xl"
                  />
                </Field>
                <Field label="Бейдж">
                  <Input
                    value={itemDraft.badge ?? ""}
                    onChange={(e) => setItemDraft({ ...itemDraft, badge: e.target.value })}
                    className="border-admin-line h-11 rounded-xl"
                  />
                </Field>
              </div>
              <Field label="Фото-иконка карточки" hint="Если загружено фото — оно заменит иконку.">
                <div className="flex items-center gap-3">
                  <DiagnosticsIcon
                    icon={itemDraft.icon}
                    imageUrl={itemDraft.image_url}
                    title={itemDraft.title ?? ""}
                  />
                  <input
                    ref={itemFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadImage(file, "item");
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-admin-line h-10 rounded-xl"
                    disabled={uploading}
                    onClick={() => itemFileRef.current?.click()}
                  >
                    <Upload className="mr-1.5 size-4" /> Загрузить
                  </Button>
                  {itemDraft.image_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive h-10 rounded-xl"
                      onClick={() => setItemDraft({ ...itemDraft, image_url: null })}
                    >
                      Убрать
                    </Button>
                  )}
                </div>
              </Field>
              <Field label="Описание">
                <Textarea
                  rows={5}
                  value={itemDraft.body ?? ""}
                  onChange={(e) => setItemDraft({ ...itemDraft, body: e.target.value })}
                  className="border-admin-line rounded-xl"
                />
              </Field>
              <Field label="Что входит / виды" hint="Через запятую или с новой строки">
                <Textarea
                  rows={3}
                  value={itemDraft.includes ?? ""}
                  onChange={(e) => setItemDraft({ ...itemDraft, includes: e.target.value })}
                  className="border-admin-line rounded-xl"
                />
              </Field>
              <Field label="Подготовка">
                <Textarea
                  rows={3}
                  value={itemDraft.preparation ?? ""}
                  onChange={(e) => setItemDraft({ ...itemDraft, preparation: e.target.value })}
                  className="border-admin-line rounded-xl"
                />
              </Field>
              <Field label="SEO title">
                <Input
                  value={itemDraft.meta_title ?? ""}
                  onChange={(e) => setItemDraft({ ...itemDraft, meta_title: e.target.value })}
                  className="border-admin-line h-11 rounded-xl"
                />
              </Field>
              <Field label="SEO description">
                <Textarea
                  rows={3}
                  value={itemDraft.meta_description ?? ""}
                  onChange={(e) => setItemDraft({ ...itemDraft, meta_description: e.target.value })}
                  className="border-admin-line rounded-xl"
                />
              </Field>
              <div className="flex items-center gap-3">
                <Switch
                  checked={itemDraft.is_active ?? true}
                  onCheckedChange={(v) => setItemDraft({ ...itemDraft, is_active: v })}
                />
                <span className="text-admin-muted text-[13px]">
                  {itemDraft.is_active ?? true ? "Опубликовано" : "Черновик"}
                </span>
              </div>
              <SubmitRow onCancel={() => setItemDraft(null)} pending={saveItem.isPending} />
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-semibold">{label}</Label>
      {children}
      {hint && <p className="text-admin-muted text-[12px]">{hint}</p>}
    </div>
  );
}

function SubmitRow({ onCancel, pending }: { onCancel: () => void; pending: boolean }) {
  return (
    <div className="flex gap-2 pt-2">
      <Button
        type="submit"
        disabled={pending}
        className="bg-admin-blue hover:bg-admin-blue/90 h-11 flex-1 rounded-xl font-semibold text-white"
      >
        Сохранить
      </Button>
      <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={onCancel}>
        Отмена
      </Button>
    </div>
  );
}
