import { createFileRoute } from "@tanstack/react-router";

import { CrudManager } from "@/components/admin/CrudManager";
import { PageHeader } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/_authenticated/admin/napravleniya")({
  head: () => ({
    meta: [
      { title: "Направления — админка Avicenna" },
      { name: "description", content: "Управление медицинскими направлениями клиники «Авиценна»: тексты, SEO и порядок." },
      { property: "og:title", content: "Направления — админка Avicenna" },
      { property: "og:description", content: "Редактирование направлений и их SEO-описаний." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSpecialties,
});

function AdminSpecialties() {
  return (
    <>
      <PageHeader
        eyebrow="Медицина"
        title="Направления"
        description="Каждое направление — отдельная страница с SEO-разметкой, вступлением и подробным описанием."
      />
      <CrudManager
        table="specialties"
        queryKey="admin-specialties"
        select="id, slug, name, h1_title, meta_title, meta_description, intro, body, tile_color, sort_order, is_active"
        titleField="name"
        subtitleField="slug"
        addLabel="Новое направление"
        searchFields={["name", "slug"]}
        defaults={{ tile_color: "bg-tile-mint", is_active: true, sort_order: 100 }}
        fields={[
          { name: "name", label: "Название", type: "text" },
          { name: "slug", label: "Адрес (slug)", type: "text", hint: "Например: hirurgiya" },
          { name: "h1_title", label: "Заголовок H1", type: "text" },
          { name: "intro", label: "Вступление", type: "textarea" },
          { name: "body", label: "Основной текст", type: "textarea" },
          { name: "meta_title", label: "SEO title", type: "text" },
          { name: "meta_description", label: "SEO description", type: "textarea" },
          { name: "sort_order", label: "Порядок", type: "number" },
          { name: "is_active", label: "Публикация", type: "switch" },
        ]}
      />
    </>
  );
}
