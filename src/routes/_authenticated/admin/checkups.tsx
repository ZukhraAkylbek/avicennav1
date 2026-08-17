import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GripVertical, Image as ImageIcon, Plus, Trash2, Upload } from "lucide-react";

import { PageHeader, Panel } from "@/components/admin/PageHeader";
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
import { useSiteRefresh } from "@/lib/admin-refresh";

export const Route = createFileRoute("/_authenticated/admin/checkups")({
  head: () => ({
    meta: [
      { title: "Чекапы — админка Avicenna" },
      {
        name: "description",
        content: "Конструктор страницы «Чекапы»: порядок блоков и карточки программ.",
      },
      { property: "og:title", content: "Чекапы — админка Avicenna" },
      {
        property: "og:description",
        content: "Перетаскивание блоков страницы и редактирование карточек чекапов.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCheckups,
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
  sort_order: number;
  is_active: boolean;
};

type CardRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  image_url: string | null;
  price: string | null;
  body: string | null;
  sort_order: number;
  is_active: boolean;
};

const SECTION_SELECT = "id, key, title, subtitle, body, sort_order, is_active";
const CARD_SELECT =
  "id, slug, title, subtitle, badge, image_url, price, body, sort_order, is_active";

function AdminCheckups() {
  const queryClient = useQueryClient();
  const [sectionDraft, setSectionDraft] = useState<Partial<SectionRow> | null>(null);
  const [cardDraft, setCardDraft] = useState<Partial<CardRow> | null>(null);
  const [order, setOrder] = useState<SectionRow[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const refreshSite = useSiteRefresh();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-checkup-sections"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-checkup-cards"] });
    void refreshSite();
  };

  const { data: sections, isLoading: loadingSections } = useQuery({
    queryKey: ["admin-checkup-sections"],
    queryFn: async (): Promise<SectionRow[]> => {
      const { data, error } = await supabase
        .from("checkup_sections")
        .select(SECTION_SELECT)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: cards, isLoading: loadingCards } = useQuery({
    queryKey: ["admin-checkup-cards"],
    queryFn: async (): Promise<CardRow[]> => {
      const { data, error } = await supabase
        .from("checkup_cards")
        .select(CARD_SELECT)
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
            .from("checkup_sections")
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
      const { error } = await supabase.from("checkup_sections").update({ is_active }).eq("id", id);
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
        is_active: values.is_active ?? true,
        sort_order: values.sort_order ?? (order.length + 1),
      };
      if (!payload.title) throw new Error("Укажите название блока");
      if (values.id) {
        const { error } = await supabase
          .from("checkup_sections")
          .update(payload)
          .eq("id", values.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("checkup_sections").insert(payload);
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
      const { error } = await supabase.from("checkup_sections").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Блок удалён");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveCard = useMutation({
    mutationFn: async (values: Partial<CardRow>) => {
      const payload = {
        slug: slugify(values.slug || values.title || "") || `chekap-${Date.now()}`,
        title: (values.title ?? "").trim(),
        subtitle: values.subtitle ?? null,
        badge: values.badge ?? null,
        price: values.price ?? null,
        body: values.body ?? null,
        image_url: values.image_url ?? null,
        is_active: values.is_active ?? true,
        sort_order: values.sort_order ?? ((cards?.length ?? 0) + 1),
      };
      if (!payload.title) throw new Error("Укажите название карточки");
      if (values.id) {
        const { error } = await supabase.from("checkup_cards").update(payload).eq("id", values.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("checkup_cards").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Карточка сохранена");
      setCardDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeCard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checkup_cards").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Карточка удалена");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveCard = useMutation({
    mutationFn: async ({ id, sort_order }: { id: string; sort_order: number }) => {
      const { error } = await supabase.from("checkup_cards").update({ sort_order }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `checkups/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from(SITE_IMAGES_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw new Error(error.message);
      const { data, error: signError } = await supabase.storage
        .from(SITE_IMAGES_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 3650);
      if (signError) throw new Error(signError.message);
      setCardDraft((prev) => (prev ? { ...prev, image_url: data?.signedUrl ?? null } : prev));
      toast.success("Изображение загружено");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
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

  function swapCards(index: number, direction: -1 | 1) {
    if (!cards) return;
    const a = cards[index];
    const b = cards[index + direction];
    if (!a || !b) return;
    moveCard.mutate({ id: a.id, sort_order: b.sort_order });
    moveCard.mutate({ id: b.id, sort_order: a.sort_order });
  }

  return (
    <>
      <PageHeader
        eyebrow="Контент"
        title="Чекапы"
        description="Собирайте страницу «Чекапы» из блоков: перетаскивайте порядок, включайте и выключайте разделы, редактируйте карточки программ."
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
              onClick={() => setCardDraft({ is_active: true })}
            >
              <Plus className="mr-1.5 size-4" /> Карточка
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Блоки страницы"
          description="Потяните за ручку, чтобы изменить порядок. Порядок сохраняется автоматически."
        >
          {loadingSections ? (
            <p className="text-admin-muted text-sm">Загрузка…</p>
          ) : (
            <ul className="space-y-2">
              {order.map((row) => (
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
                    <p className="truncate text-[15px] font-bold">{row.title}</p>
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
          )}
        </Panel>

        <Panel
          title="Карточки чекапов"
          description="Флагманские программы: фото, бейдж, цена и подробный текст внутри."
        >
          {loadingCards ? (
            <p className="text-admin-muted text-sm">Загрузка…</p>
          ) : (
            <ul className="space-y-2">
              {(cards ?? []).map((card, index) => (
                <li
                  key={card.id}
                  className="border-admin-line bg-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-2.5"
                >
                  <span className="bg-admin-teal-soft text-admin-teal grid size-9 place-items-center rounded-lg text-[13px] font-extrabold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    className="min-w-0 text-left"
                    onClick={() => setCardDraft({ ...card })}
                  >
                    <p className="truncate text-[15px] font-bold">{card.title}</p>
                    <p className="text-admin-muted truncate text-[12px]">
                      {card.price ?? "цена не указана"} · /checkups/{card.slug}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl"
                      aria-label="Выше"
                      disabled={index === 0}
                      onClick={() => swapCards(index, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl"
                      aria-label="Ниже"
                      disabled={index === (cards?.length ?? 0) - 1}
                      onClick={() => swapCards(index, 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive rounded-xl"
                      aria-label="Удалить карточку"
                      onClick={() => {
                        if (confirm("Удалить карточку?")) removeCard.mutate(card.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Редактор блока */}
      <Sheet open={sectionDraft !== null} onOpenChange={(open) => !open && setSectionDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{sectionDraft?.id ? "Блок страницы" : "Новый блок"}</SheetTitle>
            <SheetDescription>Название, подзаголовок и текст блока.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-8">
            <div>
              <Label className="text-sm">Название блока</Label>
              <Input
                className="mt-2 h-11 rounded-xl"
                value={String(sectionDraft?.title ?? "")}
                onChange={(e) =>
                  setSectionDraft((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-sm">Ключ (для якоря)</Label>
              <Input
                className="mt-2 h-11 rounded-xl"
                value={String(sectionDraft?.key ?? "")}
                onChange={(e) => setSectionDraft((prev) => ({ ...prev, key: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Подзаголовок</Label>
              <Textarea
                className="mt-2 min-h-20 rounded-xl"
                value={String(sectionDraft?.subtitle ?? "")}
                onChange={(e) =>
                  setSectionDraft((prev) => ({ ...prev, subtitle: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-sm">Текст</Label>
              <Textarea
                className="mt-2 min-h-32 rounded-xl"
                value={String(sectionDraft?.body ?? "")}
                onChange={(e) => setSectionDraft((prev) => ({ ...prev, body: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Показывать на сайте</Label>
              <Switch
                checked={Boolean(sectionDraft?.is_active ?? true)}
                onCheckedChange={(v) => setSectionDraft((prev) => ({ ...prev, is_active: v }))}
              />
            </div>
            <Button
              className="bg-admin-blue hover:bg-admin-blue/90 h-11 w-full rounded-xl font-semibold text-white"
              disabled={saveSection.isPending}
              onClick={() => sectionDraft && saveSection.mutate(sectionDraft)}
            >
              Сохранить блок
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Редактор карточки */}
      <Sheet open={cardDraft !== null} onOpenChange={(open) => !open && setCardDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{cardDraft?.id ? "Карточка чекапа" : "Новая карточка"}</SheetTitle>
            <SheetDescription>Фото, бейдж, цена и подробное описание программы.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-8">
            <div className="border-admin-line bg-admin-bg grid gap-3 rounded-2xl border p-3">
              <div className="bg-card aspect-[16/10] overflow-hidden rounded-xl">
                {cardDraft?.image_url ? (
                  <img
                    src={String(cardDraft.image_url)}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-admin-muted grid size-full place-items-center text-[12px] font-semibold">
                    <ImageIcon className="size-5" />
                  </span>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(file);
                }}
              />
              <Button
                variant="outline"
                className="border-admin-line h-11 rounded-xl"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="mr-1.5 size-4" />
                {uploading ? "Загрузка…" : "Загрузить фото"}
              </Button>
            </div>
            <div>
              <Label className="text-sm">Название</Label>
              <Input
                className="mt-2 h-11 rounded-xl"
                value={String(cardDraft?.title ?? "")}
                onChange={(e) => setCardDraft((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Адрес страницы (slug)</Label>
              <Input
                className="mt-2 h-11 rounded-xl"
                value={String(cardDraft?.slug ?? "")}
                onChange={(e) => setCardDraft((prev) => ({ ...prev, slug: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Бейдж (например «18–50 лет»)</Label>
              <Input
                className="mt-2 h-11 rounded-xl"
                value={String(cardDraft?.badge ?? "")}
                onChange={(e) => setCardDraft((prev) => ({ ...prev, badge: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Цена</Label>
              <Input
                className="mt-2 h-11 rounded-xl"
                value={String(cardDraft?.price ?? "")}
                onChange={(e) => setCardDraft((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Краткое описание</Label>
              <Textarea
                className="mt-2 min-h-20 rounded-xl"
                value={String(cardDraft?.subtitle ?? "")}
                onChange={(e) => setCardDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Что входит в программу</Label>
              <Textarea
                className="mt-2 min-h-32 rounded-xl"
                value={String(cardDraft?.body ?? "")}
                onChange={(e) => setCardDraft((prev) => ({ ...prev, body: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Показывать на сайте</Label>
              <Switch
                checked={Boolean(cardDraft?.is_active ?? true)}
                onCheckedChange={(v) => setCardDraft((prev) => ({ ...prev, is_active: v }))}
              />
            </div>
            <Button
              className="bg-admin-blue hover:bg-admin-blue/90 h-11 w-full rounded-xl font-semibold text-white"
              disabled={saveCard.isPending}
              onClick={() => cardDraft && saveCard.mutate(cardDraft)}
            >
              Сохранить карточку
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
