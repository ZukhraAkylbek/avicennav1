import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSiteRefresh } from "@/lib/admin-refresh";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Настройки — админка Avicenna" },
      { name: "description", content: "Шрифты и типографика сайта клиники «Авиценна», ссылки на разделы контента." },
      { property: "og:title", content: "Настройки — админка Avicenna" },
      { property: "og:description", content: "Глобальные настройки оформления сайта." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSettings,
});

const FONTS = [
  "Montserrat",
  "Manrope",
  "Gotham Pro",
  "Segoe UI",
  "Inter",
  "Futura",
];

function AdminSettings() {
  const queryClient = useQueryClient();
  const refreshSite = useSiteRefresh();
  const [form, setForm] = useState({ heading_font: "Montserrat", body_font: "Manrope", font_scale: 1 });

  const { data } = useQuery({
    queryKey: ["site-settings"],
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

  useEffect(() => {
    if (!data) return;
    setForm({
      heading_font: data.heading_font,
      body_font: data.body_font,
      font_scale: Number(data.font_scale),
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (data?.id) {
        const { error } = await supabase
          .from("site_settings")
          .update({
            heading_font: form.heading_font,
            body_font: form.body_font,
            font_scale: form.font_scale,
          })
          .eq("id", data.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("site_settings").insert({
          heading_font: form.heading_font,
          body_font: form.body_font,
          font_scale: form.font_scale,
        });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Настройки сохранены");
      void refreshSite();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <PageHeader
        eyebrow="Оформление"
        title="Настройки"
        description="Глобальная типографика сайта. Изменения применяются ко всем страницам сразу."
        actions={
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="bg-admin-blue hover:bg-admin-blue/90 rounded-xl font-bold text-white"
          >
            {save.isPending ? "Сохраняем…" : "Сохранить"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Шрифты" description="Заголовки и основной текст">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-[13px] font-semibold">Шрифт заголовков</Label>
              <Select
                value={form.heading_font}
                onValueChange={(v) => setForm((p) => ({ ...p, heading_font: v }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[13px] font-semibold">Шрифт текста</Label>
              <Select
                value={form.body_font}
                onValueChange={(v) => setForm((p) => ({ ...p, body_font: v }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="scale" className="text-[13px] font-semibold">
                Масштаб шрифта
              </Label>
              <Input
                id="scale"
                type="number"
                step="0.05"
                min="0.8"
                max="1.4"
                value={form.font_scale}
                onChange={(e) => setForm((p) => ({ ...p, font_scale: Number(e.target.value) }))}
                className="rounded-xl"
              />
              <p className="text-admin-muted text-[12px]">1.0 — обычный размер, 1.1 — крупнее на 10%.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Контент сайта" description="Разделы визуального редактирования">
          <div className="grid gap-2 text-[13.5px] font-semibold">
            <Link to="/admin/content" className="border-admin-line hover:bg-admin-blue-soft rounded-xl border px-4 py-3">
              Тексты и картинки блоков
            </Link>
            <Link to="/admin/hero" className="border-admin-line hover:bg-admin-blue-soft rounded-xl border px-4 py-3">
              Слайдер на главной
            </Link>
            <Link to="/" className="border-admin-line hover:bg-admin-blue-soft rounded-xl border px-4 py-3">
              Открыть сайт и редактировать на месте
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
}
