import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { MOBILE_NAV_SLOTS } from "@/components/MobileNavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { fetchSiteContent } from "@/lib/site-content";
import { useSiteRefresh } from "@/lib/admin-refresh";

export const Route = createFileRoute("/_authenticated/admin/mobile-nav")({
  head: () => ({
    meta: [
      { title: "Мобильное меню — админка Avicenna" },
      {
        name: "description",
        content: "Настройка нижней навигации мобильной версии сайта клиники «Авиценна».",
      },
      { property: "og:title", content: "Мобильное меню — админка Avicenna" },
      { property: "og:description", content: "Названия и адреса пунктов нижней навигации." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMobileNav,
});

const ICON_HINT = ["Клиника", "Врачи", "Кнопка записи (центр)", "Стетоскоп", "Локация"];

function AdminMobileNav() {
  const queryClient = useQueryClient();
  const refreshSite = useSiteRefresh();
  const { data } = useQuery({ queryKey: ["site-content"], queryFn: fetchSiteContent });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    MOBILE_NAV_SLOTS.forEach((slot, i) => {
      const n = i + 1;
      next[`mobilenav.${n}.label`] = data[`mobilenav.${n}.label`]?.value ?? slot.label;
      next[`mobilenav.${n}.href`] = data[`mobilenav.${n}.href`]?.value ?? slot.href;
    });
    setValues(next);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = Object.entries(values).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Мобильное меню сохранено");
      void refreshSite();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const set = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHeader
        eyebrow="Мобильная версия"
        title="Нижняя навигация"
        description="Пять пунктов нижней панели на телефонах. Центральный пункт — крупная кнопка записи. Укажите название и адрес: внутренний (/checkups, /#uslugi) или внешнюю ссылку (https://…)."
      />

      <Panel title="Пункты меню" description="Слева направо, как на телефоне">
        <div className="space-y-5">
          {MOBILE_NAV_SLOTS.map((slot, i) => {
            const n = i + 1;
            return (
              <div key={n} className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="text-admin-muted text-[12px] font-bold uppercase tracking-wide">
                    Пункт {n} · {ICON_HINT[i]}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`label-${n}`}>Название</Label>
                  <Input
                    id={`label-${n}`}
                    value={values[`mobilenav.${n}.label`] ?? ""}
                    placeholder={slot.label}
                    onChange={(e) => set(`mobilenav.${n}.label`, e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`href-${n}`}>Адрес страницы</Label>
                  <Input
                    id={`href-${n}`}
                    value={values[`mobilenav.${n}.href`] ?? ""}
                    placeholder={slot.href}
                    onChange={(e) => set(`mobilenav.${n}.href`, e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Сохраняем…" : "Сохранить"}
          </Button>
        </div>
      </Panel>
    </>
  );
}
