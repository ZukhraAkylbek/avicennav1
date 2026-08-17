import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
import { useSiteRefresh } from "@/lib/admin-refresh";
  HERO_BUCKET,
  fetchAllHeroSlides,
  type HeroSlideWithUrl,
} from "@/lib/hero-slides";

export const Route = createFileRoute("/_authenticated/admin/hero")({
  head: () => ({
    meta: [
      { title: "Слайды баннера — админка Avicenna" },
      {
        name: "description",
        content: "Загрузка и редактирование фото Hero-баннера сайта Avicenna.",
      },
      { property: "og:title", content: "Слайды баннера — админка Avicenna" },
      {
        property: "og:description",
        content: "Управление слайдером главной страницы Avicenna.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminHero,
});

function AdminHero() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: slides, isLoading } = useQuery({
    queryKey: ["hero-slides", "all"],
    queryFn: fetchAllHeroSlides,
  });

  const refreshSite = useSiteRefresh();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
    void refreshSite();
  };

  const update = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<Pick<HeroSlideWithUrl, "title" | "subtitle" | "sort_order" | "is_active">>;
    }) => {
      const { error } = await supabase.from("hero_slides").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (slide: HeroSlideWithUrl) => {
      const { error } = await supabase.from("hero_slides").delete().eq("id", slide.id);
      if (error) throw error;
      if (!/^https?:\/\//i.test(slide.image_url)) {
        await supabase.storage.from(HERO_BUCKET).remove([slide.image_url]);
      }
    },
    onSuccess: () => {
      toast.success("Слайд удалён");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `slides/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(HERO_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const nextOrder = (slides?.length ?? 0) + 1;
      const { error } = await supabase
        .from("hero_slides")
        .insert({ image_url: path, sort_order: nextOrder, is_active: true });
      if (error) throw error;

      toast.success("Фото загружено");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
  };

  return (
    <div className="bg-background min-h-screen">
      <Toaster />
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-foreground text-2xl font-semibold">Слайды баннера</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Загружайте фото клиники, акций и новостей — они сразу появятся на главной.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/content">Тексты</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">На сайт</Link>
            </Button>
            <Button variant="ghost" onClick={signOut}>
              Выйти
            </Button>
          </div>
        </div>

        <div className="border-border mt-8 rounded-xl border border-dashed p-6">
          <Label htmlFor="slide-file" className="text-sm font-medium">
            Новое фото
          </Label>
          <div className="mt-3 flex items-center gap-3">
            <Input
              id="slide-file"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
                e.target.value = "";
              }}
            />
            <Upload className="text-muted-foreground size-5" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {isLoading && <p className="text-muted-foreground text-sm">Загрузка…</p>}
          {slides?.length === 0 && (
            <p className="text-muted-foreground text-sm">Слайдов пока нет.</p>
          )}
          {slides?.map((slide) => (
            <div
              key={slide.id}
              className="border-border grid gap-4 rounded-xl border p-4 sm:grid-cols-[160px_1fr]"
            >
              <img
                src={slide.displayUrl}
                alt={slide.title ?? "Слайд"}
                loading="lazy"
                className="h-24 w-full rounded-lg object-cover sm:h-full"
              />
              <div className="space-y-3">
                <Input
                  defaultValue={slide.title ?? ""}
                  placeholder="Заголовок"
                  onBlur={(e) =>
                    update.mutate({ id: slide.id, values: { title: e.target.value } })
                  }
                />
                <Input
                  defaultValue={slide.subtitle ?? ""}
                  placeholder="Подзаголовок"
                  onBlur={(e) =>
                    update.mutate({ id: slide.id, values: { subtitle: e.target.value } })
                  }
                />
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`order-${slide.id}`} className="text-sm">
                      Порядок
                    </Label>
                    <Input
                      id={`order-${slide.id}`}
                      type="number"
                      className="w-20"
                      defaultValue={slide.sort_order}
                      onBlur={(e) =>
                        update.mutate({
                          id: slide.id,
                          values: { sort_order: Number(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`active-${slide.id}`}
                      checked={slide.is_active}
                      onCheckedChange={(checked) =>
                        update.mutate({ id: slide.id, values: { is_active: checked } })
                      }
                    />
                    <Label htmlFor={`active-${slide.id}`} className="text-sm">
                      Показывать
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-brand-terracotta ml-auto"
                    onClick={() => remove.mutate(slide)}
                  >
                    <Trash2 className="mr-2 size-4" aria-hidden="true" />
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
