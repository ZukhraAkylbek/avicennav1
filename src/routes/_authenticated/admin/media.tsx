import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Upload, Trash2 } from "lucide-react";

import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SITE_IMAGES_BUCKET } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin/media")({
  head: () => ({
    meta: [
      { title: "Медиа — админка Avicenna" },
      { name: "description", content: "Библиотека изображений сайта клиники «Авиценна»: загрузка и ссылки." },
      { property: "og:title", content: "Медиа — админка Avicenna" },
      { property: "og:description", content: "Загрузка и управление изображениями сайта." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMedia,
});

function AdminMedia() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const { data: files, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(SITE_IMAGES_BUCKET)
        .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data ?? []).filter((f) => f.id !== null);
    },
  });

  const publicUrl = (name: string) =>
    supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(name).data.publicUrl;

  const remove = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.storage.from(SITE_IMAGES_BUCKET).remove([name]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Файл удалён");
      void queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function upload(fileList: FileList | null) {
    if (!fileList?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(fileList)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from(SITE_IMAGES_BUCKET)
          .upload(path, file, { upsert: false, contentType: file.type });
        if (error) throw new Error(error.message);
      }
      toast.success("Загружено");
      void queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Библиотека"
        title="Медиа"
        description="Загружайте фото клиники, врачей и баннеров. Скопируйте ссылку и вставьте её в нужный блок."
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => void upload(e.target.files)}
            />
            <Button
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="bg-admin-blue hover:bg-admin-blue/90 gap-2 rounded-xl font-bold text-white"
            >
              <Upload className="size-4" strokeWidth={2} />
              {busy ? "Загружаем…" : "Загрузить"}
            </Button>
          </>
        }
      />

      <Panel>
        {isLoading ? (
          <p className="text-admin-muted text-[14px]">Загрузка…</p>
        ) : !files?.length ? (
          <p className="text-admin-muted text-[14px]">Пока нет файлов — загрузите первое изображение.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => {
              const url = publicUrl(file.name);
              return (
                <figure key={file.name} className="border-admin-line overflow-hidden rounded-2xl border">
                  <img
                    src={url}
                    alt={file.name}
                    loading="lazy"
                    className="bg-admin-blue-soft aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="flex items-center justify-between gap-2 p-3">
                    <span className="text-admin-muted truncate text-[12px]">{file.name}</span>
                    <span className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        title="Скопировать ссылку"
                        onClick={() => {
                          void navigator.clipboard.writeText(url);
                          toast.success("Ссылка скопирована");
                        }}
                        className="hover:bg-admin-blue-soft rounded-lg p-1.5"
                      >
                        <Copy className="size-4" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        title="Удалить"
                        onClick={() => remove.mutate(file.name)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" strokeWidth={1.9} />
                      </button>
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}
