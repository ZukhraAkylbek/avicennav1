import { createFileRoute } from "@tanstack/react-router";

import { CrudManager } from "@/components/admin/CrudManager";
import { PageHeader } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/_authenticated/admin/diagnostics")({
  head: () => ({
    meta: [
      { title: "Диагностика — админка Avicenna" },
      { name: "description", content: "Страницы диагностики и лабораторных исследований клиники «Авиценна»." },
      { property: "og:title", content: "Диагностика — админка Avicenna" },
      { property: "og:description", content: "Редактирование страниц раздела /diagnostika." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDiagnostics,
});

function AdminDiagnostics() {
  return (
    <>
      <PageHeader
        eyebrow="Исследования"
        title="Диагностика"
        description="Страницы внутри раздела /diagnostika: УЗИ, МРТ, лаборатория, чекапы."
      />
      <CrudManager
        table="pages"
        queryKey="admin-diagnostics"
        select="id, slug, path, title, h1_title, meta_title, meta_description, body, sort_order, is_published"
        orderBy={{ column: "path" }}
        filter={{ column: "path", ilike: "/diagnostika%" }}
        titleField="title"
        subtitleField="path"
        badgeField="is_published"
        addLabel="Новое исследование"
        searchFields={["title", "path"]}
        defaults={{ is_published: true, sort_order: 100, path: "/diagnostika/", slug: "" }}
        fields={[
          { name: "title", label: "Название", type: "text" },
          { name: "slug", label: "Slug", type: "text" },
          { name: "path", label: "Полный адрес", type: "text", hint: "Начинайте с /diagnostika/" },
          { name: "h1_title", label: "Заголовок H1", type: "text" },
          { name: "body", label: "Описание", type: "textarea" },
          { name: "meta_title", label: "SEO title", type: "text" },
          { name: "meta_description", label: "SEO description", type: "textarea" },
          { name: "sort_order", label: "Порядок", type: "number" },
          { name: "is_published", label: "Публикация", type: "switch" },
        ]}
      />
    </>
  );
}
