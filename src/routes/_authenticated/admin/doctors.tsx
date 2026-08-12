import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { CrudManager } from "@/components/admin/CrudManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/doctors")({
  head: () => ({
    meta: [
      { title: "Врачи — админка Avicenna" },
      { name: "description", content: "Карточки врачей клиники «Авиценна»: должность, опыт, образование и фото." },
      { property: "og:title", content: "Врачи — админка Avicenna" },
      { property: "og:description", content: "Добавление и редактирование специалистов клиники." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDoctors,
});

function AdminDoctors() {
  const { data: specialties } = useQuery({
    queryKey: ["admin-specialty-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialties")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Команда"
        title="Врачи"
        description="Специалисты выводятся на страницах направлений и в блоке «Специалисты» на главной."
      />
      <CrudManager
        table="doctors"
        queryKey="admin-doctors"
        select="id, specialty_id, slug, full_name, job_title, photo_url, bio, experience_years, education, sort_order, is_active"
        titleField="full_name"
        subtitleField="job_title"
        addLabel="Добавить врача"
        searchFields={["full_name", "job_title", "slug"]}
        defaults={{ is_active: true, sort_order: 100 }}
        fields={[
          { name: "full_name", label: "ФИО", type: "text" },
          { name: "slug", label: "Адрес (slug)", type: "text" },
          { name: "job_title", label: "Должность", type: "text" },
          {
            name: "specialty_id",
            label: "Направление",
            type: "select",
            options: (specialties ?? []).map((s) => ({ value: s.id, label: s.name })),
          },
          { name: "experience_years", label: "Опыт, лет", type: "number" },
          { name: "education", label: "Образование", type: "textarea" },
          { name: "bio", label: "О враче", type: "textarea" },
          { name: "photo_url", label: "Ссылка на фото", type: "text", hint: "Загрузите файл в разделе «Медиа» и вставьте ссылку" },
          { name: "sort_order", label: "Порядок", type: "number" },
          { name: "is_active", label: "Публикация", type: "switch" },
        ]}
      />
    </>
  );
}
