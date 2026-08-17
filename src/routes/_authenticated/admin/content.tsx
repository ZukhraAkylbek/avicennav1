import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  CONTENT_FIELDS,
  SITE_IMAGES_BUCKET,
  fetchSiteContent,
  type ContentField,
} from "@/lib/site-content";
import { useSiteRefresh } from "@/lib/admin-refresh";

export const Route = createFileRoute("/_authenticated/admin/content")({
  head: () => ({
    meta: [
      { title: "Тексты и картинки — админка Avicenna" },
      {
        name: "description",
        content: "Редактирование всех текстов и изображений сайта клиники Авиценна.",
      },
      { property: "og:title", content: "Тексты и картинки — админка Avicenna" },
      {
        property: "og:description",
        content: "Панель редактирования контента сайта Авиценна.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminContent,
});

function groupFields() {
  const groups = new Map<string, ContentField[]>();
  for (const field of CONTENT_FIELDS) {
    const list = groups.get(field.group) ?? [];
    list.push(field);
    groups.set(field.group, list);
  }
  return [...groups.entries()];
}

function AdminContent() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["site-content"],
    queryFn: fetchSiteContent,
  });

  const refreshSite = useSiteRefresh();
  const invalidate = () => void refreshSite();

  const saveText = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Сохранено");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadImage = async (key: string, file: File) => {
    setUploading(key);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${key.replace(/[^a-z0-9]+/gi, "-")}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(SITE_IMAGES_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { error } = await supabase.from("site_content").upsert(
        { key, image_path: path, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
      if (error) throw error;
      toast.success("Картинка обновлена");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Toaster />
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-foreground text-2xl font-semibold">Тексты и картинки</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Меняйте любые надписи, цифры счётчиков и изображения — сайт обновится сразу. Или
              откройте сайт и нажмите «Режим редактирования» внизу слева: наводите на любой текст,
              кликайте и меняйте текст, шрифт, размер и цвет прямо на странице.
            </p>

          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/pages">Страницы</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/hero">Баннер</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/">На сайт</Link>
            </Button>
          </div>
        </div>

        {isLoading && <p className="text-muted-foreground mt-8 text-sm">Загрузка…</p>}

        <div className="mt-8 space-y-10">
          {groupFields().map(([group, fields]) => (
            <section key={group}>
              <h2 className="text-foreground text-lg font-semibold">{group}</h2>
              <div className="mt-4 space-y-5">
                {fields.map((field) => {
                  const current = data?.[field.key];
                  const value = current?.value ?? "";

                  if (field.kind === "image") {
                    return (
                      <div key={field.key} className="border-border rounded-xl border p-4">
                        <Label className="text-sm font-medium">{field.label}</Label>
                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          {current?.url && (
                            <img
                              src={current.url}
                              alt={field.label}
                              loading="lazy"
                              className="h-20 w-32 rounded-lg object-cover"
                            />
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            className="max-w-xs"
                            disabled={uploading === field.key}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void uploadImage(field.key, file);
                              e.target.value = "";
                            }}
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={field.key} className="border-border rounded-xl border p-4">
                      <Label htmlFor={field.key} className="text-sm font-medium">
                        {field.label}
                      </Label>
                      {field.kind === "textarea" ? (
                        <Textarea
                          id={field.key}
                          defaultValue={value}
                          placeholder={field.fallback}
                          rows={3}
                          className="mt-3"
                          onBlur={(e) =>
                            saveText.mutate({ key: field.key, value: e.target.value })
                          }
                        />
                      ) : (
                        <Input
                          id={field.key}
                          defaultValue={value}
                          placeholder={field.fallback}
                          className="mt-3"
                          onBlur={(e) =>
                            saveText.mutate({ key: field.key, value: e.target.value })
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
