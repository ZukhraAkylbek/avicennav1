import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { PageBlocks } from "@/components/page-blocks/PageBlocks";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl } from "@/lib/clinic";
import { parseBlocks } from "@/lib/page-blocks";
import { pageQueryOptions } from "@/lib/pages.queries";

export const Route = createFileRoute("/$")({
  loader: async ({ params, context }) => {
    const path = `/${params._splat ?? ""}`.replace(/\/+$/, "") || "/";
    const page = await context.queryClient.ensureQueryData(pageQueryOptions(path));
    if (!page) throw notFound();
    return { path, page };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Страница не найдена" }, { name: "robots", content: "noindex" }],
      };
    }
    const { page, path } = loaderData;
    const title = page.meta_title || `${page.title} — Клиника «Авиценна», Бишкек`;
    const description =
      page.meta_description ||
      `${page.h1_title ?? page.title} в клинике «Авиценна» в Бишкеке. Онлайн-запись на приём.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(path) || path }],
    };
  },

  errorComponent: () => <PageShell title="Не удалось загрузить страницу" />,
  notFoundComponent: () => <PageShell title="Страница не найдена" />,
  component: CustomPage,
});

function PageShell({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-foreground text-4xl leading-tight font-extrabold sm:text-5xl">
          {title}
        </h1>
        {children}
        {!children && (
          <Link to="/" className="text-primary mt-6 inline-block font-semibold">
            На главную
          </Link>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function CustomPage() {
  const { path } = Route.useLoaderData();
  const { data: page } = useSuspenseQuery(pageQueryOptions(path));
  if (!page) return <PageShell title="Страница не найдена" />;

  const blocks = parseBlocks(page.blocks);

  if (blocks.length > 0) {
    return (
      <div className="bg-background min-h-screen">
        <SiteHeader />
        <main>
          <PageBlocks blocks={blocks} />
          {page.children.length > 0 && <ChildLinks children={page.children} />}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const paragraphs = (page.body ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <PageShell title={page.h1_title ?? page.title}>
      <div className="mt-8 space-y-5">
        {paragraphs.map((text, index) => (
          <p key={index} className="text-muted-foreground text-lg leading-relaxed">
            {text}
          </p>
        ))}
      </div>

      {page.children.length > 0 && <ChildLinks children={page.children} />}
    </PageShell>
  );
}

function ChildLinks({ children }: { children: { path: string; title: string }[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <h2 className="text-foreground text-2xl font-extrabold">Подразделы</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {children.map((child) => (
          <a
            key={child.path}
            href={child.path}
            className="bg-surface-green text-foreground hover:bg-surface-soft rounded-xl px-5 py-4 text-lg font-bold transition-colors"
          >
            {child.title}
          </a>
        ))}
      </div>
    </div>
  );
}
