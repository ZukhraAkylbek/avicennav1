import { createFileRoute, Link } from "@tanstack/react-router";

import { CrudManager } from "@/components/admin/CrudManager";
import { PageHeader, Panel } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  head: () => ({
    meta: [
      { title: "SEO — админка Avicenna" },
      { name: "description", content: "SEO-заголовки и описания страниц и направлений клиники «Авиценна»." },
      { property: "og:title", content: "SEO — админка Avicenna" },
      { property: "og:description", content: "Управление title, description и sitemap сайта." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSeo,
});

function AdminSeo() {
  return (
    <>
      <PageHeader
        eyebrow="Продвижение"
        title="SEO"
        description="Заголовки и описания попадают в поиск и соцсети. Sitemap и canonical формируются автоматически."
      />

      <Panel className="mb-6" title="Технические файлы">
        <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="border-admin-line hover:bg-admin-blue-soft rounded-xl border px-3 py-2"
          >
            sitemap.xml
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="border-admin-line hover:bg-admin-blue-soft rounded-xl border px-3 py-2"
          >
            robots.txt
          </a>
          <Link
            to="/admin/pages"
            className="border-admin-line hover:bg-admin-blue-soft rounded-xl border px-3 py-2"
          >
            Структура страниц
          </Link>
        </div>
      </Panel>

      <h2 className="mb-3 text-[18px] font-bold">Направления</h2>
      <CrudManager
        table="specialties"
        queryKey="admin-seo-specialties"
        select="id, name, slug, meta_title, meta_description, is_active"
        titleField="name"
        subtitleField="meta_title"
        addLabel="Новое направление"
        searchFields={["name", "meta_title"]}
        fields={[
          { name: "meta_title", label: "SEO title", type: "text" },
          { name: "meta_description", label: "SEO description", type: "textarea" },
          { name: "name", label: "Название", type: "text" },
          { name: "slug", label: "Slug", type: "text" },
        ]}
      />

      <h2 className="mt-10 mb-3 text-[18px] font-bold">Страницы</h2>
      <CrudManager
        table="pages"
        queryKey="admin-seo-pages"
        select="id, title, path, meta_title, meta_description, is_published"
        orderBy={{ column: "path" }}
        titleField="title"
        subtitleField="path"
        badgeField="is_published"
        addLabel="Новая страница"
        searchFields={["title", "path", "meta_title"]}
        fields={[
          { name: "meta_title", label: "SEO title", type: "text" },
          { name: "meta_description", label: "SEO description", type: "textarea" },
          { name: "title", label: "Название", type: "text" },
          { name: "path", label: "Адрес", type: "text" },
        ]}
      />
    </>
  );
}
