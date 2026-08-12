import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CLINIC, doubleGisSearchUrl } from "@/lib/clinic";
import { fetchSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin/branches")({
  head: () => ({
    meta: [
      { title: "Филиалы — админка Avicenna" },
      { name: "description", content: "Адреса филиалов клиники «Авиценна» в Бишкеке и ссылки на карты." },
      { property: "og:title", content: "Филиалы — админка Avicenna" },
      { property: "og:description", content: "Редактирование адресов филиалов клиники." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminBranches,
});

function AdminBranches() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["site-content"], queryFn: fetchSiteContent });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    CLINIC.branches.forEach((branch, i) => {
      const key = `branches.${i + 1}.address`;
      next[key] = data[key]?.value ?? branch.name;
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
      toast.success("Адреса сохранены");
      void queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <PageHeader
        eyebrow="География"
        title="Филиалы"
        description="Адреса выводятся в блоке «Наши филиалы» на главной. Ссылки на карты строятся автоматически."
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

      <Panel title="Адреса" description="6 филиалов в Бишкеке">
        <div className="grid gap-4 sm:grid-cols-2">
          {CLINIC.branches.map((branch, i) => {
            const key = `branches.${i + 1}.address`;
            const value = values[key] ?? branch.name;
            return (
              <div key={key} className="grid gap-1.5">
                <Label htmlFor={key} className="text-[13px] font-semibold">
                  Филиал {i + 1}
                </Label>
                <Input
                  id={key}
                  value={value}
                  onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="rounded-xl"
                />
                <a
                  href={doubleGisSearchUrl(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-admin-teal text-[12px] font-semibold hover:underline"
                >
                  Проверить в 2ГИС
                </a>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
