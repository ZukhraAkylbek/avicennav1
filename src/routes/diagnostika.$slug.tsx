import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { CalendarCheck, ChevronRight } from "lucide-react";

import { DiagnosticsIcon } from "@/components/DiagnosticsIcon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl } from "@/lib/clinic";
import { diagnosticsItemQueryOptions } from "@/lib/diagnostics.queries";
import { BOOKING_URL } from "@/lib/site-config";

export const Route = createFileRoute("/diagnostika/$slug")({
  loader: async ({ params, context }) => {
    const item = await context.queryClient.ensureQueryData(
      diagnosticsItemQueryOptions(params.slug),
    );
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Исследование не найдено" }, { name: "robots", content: "noindex" }] };
    }
    const { item } = loaderData;
    const title = item.meta_title || `${item.title} в Бишкеке — клиника «Авиценна»`;
    const description =
      item.meta_description ||
      item.subtitle ||
      `${item.title} в клинике «Авиценна» в Бишкеке. Оборудование экспертного класса, заключение в день исследования.`;
    const url = absoluteUrl(`/diagnostika/${params.slug}`) || `/diagnostika/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  errorComponent: () => <Fallback title="Не удалось загрузить исследование" />,
  notFoundComponent: () => <Fallback title="Исследование не найдено" />,
  component: DiagnosticsItemPage,
});

function Fallback({ title }: { title: string }) {
  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-foreground text-4xl font-extrabold">{title}</h1>
        <Link to="/diagnostika" className="text-primary mt-6 inline-block font-semibold">
          Все исследования
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function DiagnosticsItemPage() {
  const { slug } = Route.useParams();
  const { data: item } = useSuspenseQuery(diagnosticsItemQueryOptions(slug));
  if (!item) return <Fallback title="Исследование не найдено" />;

  const includes = (item.includes ?? "")
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main>
        <section className="border-border border-b">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
            <nav className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px] font-semibold">
              <Link to="/" className="hover:text-foreground">
                Главная
              </Link>
              <ChevronRight className="size-3.5" />
              <Link to="/diagnostika" className="hover:text-foreground">
                Диагностика
              </Link>
              <ChevronRight className="size-3.5" />
              <span className="text-foreground">{item.title}</span>
            </nav>

            <div className="mt-6 flex items-start gap-4">
              <DiagnosticsIcon
                icon={item.icon}
                imageUrl={item.image_url}
                title={item.title}
                className="size-16 rounded-3xl"
              />
              <div>
                <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-5xl">
                  {item.title}
                </h1>
                {item.subtitle && (
                  <p className="text-muted-foreground mt-3 max-w-2xl text-[17px] leading-relaxed sm:text-[19px]">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[16px] font-extrabold transition-colors"
              >
                <CalendarCheck className="size-5" strokeWidth={2.2} />
                Записаться
              </a>
              {item.price && (
                <span className="text-foreground text-[18px] font-extrabold">{item.price}</span>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            {item.body && (
              <section>
                <h2 className="text-foreground text-2xl font-extrabold">Об исследовании</h2>
                <p className="text-muted-foreground mt-3 text-[17px] leading-relaxed whitespace-pre-line">
                  {item.body}
                </p>
              </section>
            )}

            {includes.length > 0 && (
              <section>
                <h2 className="text-foreground text-2xl font-extrabold">Что входит / виды</h2>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {includes.map((entry) => (
                    <li
                      key={entry}
                      className="border-border text-foreground rounded-full border px-4 py-2 text-[15px] font-semibold"
                    >
                      {entry}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            {item.preparation && (
              <div className="bg-surface-soft rounded-3xl p-6">
                <h2 className="text-foreground text-[18px] font-extrabold">Подготовка</h2>
                <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                  {item.preparation}
                </p>
              </div>
            )}
            <div className="border-border rounded-3xl border p-6">
              <p className="text-foreground text-[16px] font-extrabold">Нужна помощь с выбором?</p>
              <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                Врач подскажет, какое исследование подойдёт именно вам.
              </p>
              <Link to="/diagnostika" className="text-primary mt-4 inline-block font-bold">
                Все исследования
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
