import { createFileRoute } from "@tanstack/react-router";

import { CrudManager } from "@/components/admin/CrudManager";
import { PageHeader } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/_authenticated/admin/services")({
  head: () => ({
    meta: [
      { title: "Услуги — админка Avicenna" },
      { name: "description", content: "Страницы услуг клиники «Авиценна»: описание, цены и SEO." },
      { property: "og:title", content: "Услуги — админка Avicenna" },
      { property: "og:description", content: "Редактирование страниц услуг в разделе /uslugi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminServices,
});

function AdminServices() {
  return (
    <>
      <PageHeader
        eyebrow="Каталог"
        title="Услуги"
        description="Страницы внутри раздела /uslugi. Адрес указывайте полностью, например /uslugi/priem-terapevta."
      />
      <CrudManager
        table="pages"
        queryKey="admin-services"
        select="id, slug, path, title, h1_title, meta_title, meta_description, body, sort_order, is_published"
        orderBy={{ column: "path" }}
        filter={{ column: "path", ilike: "/uslugi%" }}
        titleField="title"
        subtitleField="path"
        badgeField="is_published"
        addLabel="Новая услуга"
        searchFields={["title", "path"]}
        defaults={{ is_published: true, sort_order: 100, path: "/uslugi/", slug: "" }}
        fields={[
          { name: "title", label: "Название", type: "text" },
          { name: "slug", label: "Slug", type: "text" },
          { name: "path", label: "Полный адрес", type: "text", hint: "Начинайте с /uslugi/" },
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
