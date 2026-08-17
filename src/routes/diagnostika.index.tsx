import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, ChevronRight } from "lucide-react";

import { DiagnosticsIcon } from "@/components/DiagnosticsIcon";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SymptomNavigator } from "@/components/SymptomNavigator";
import { absoluteUrl } from "@/lib/clinic";
import { diagnosticsPageQueryOptions } from "@/lib/diagnostics.queries";
import { BOOKING_URL } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const TITLE = "Диагностика в Бишкеке — УЗИ, МРТ, КТ, анализы | Авиценна";
const DESCRIPTION =
  "Диагностика в клинике «Авиценна» в Бишкеке: УЗИ, МРТ, КТ, рентген, ЭКГ, лабораторные анализы и эндоскопия. Оборудование экспертного класса, заключение в день исследования.";

export const Route = createFileRoute("/diagnostika/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(diagnosticsPageQueryOptions());
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/diagnostika") || "/diagnostika" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/diagnostika") || "/diagnostika" }],
  }),
  errorComponent: () => (
    <PageShell>
      <h1 className="text-3xl font-extrabold">Не удалось загрузить страницу диагностики</h1>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <h1 className="text-3xl font-extrabold">Страница не найдена</h1>
    </PageShell>
  ),
  component: DiagnosticsPage,
});

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}

function DiagnosticsPage() {
  const { data } = useSuspenseQuery(diagnosticsPageQueryOptions());
  const { sections, categories, symptoms, items } = data;
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const section = (key: string) => sections.find((s) => s.key === key) ?? null;
  const hero = section("hero");
  const navigator = section("navigator");
  const catalog = section("catalog");
  const advantages = section("advantages");
  const cta = section("cta");

  const filtered = useMemo(
    () => (activeCategory ? items.filter((i) => i.category_key === activeCategory) : items),
    [items, activeCategory],
  );

  const bookingUrl = hero?.primary_url || BOOKING_URL;

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main>
        {hero && (
          <section className="border-border border-b">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
              <nav className="text-muted-foreground flex items-center gap-1.5 text-[13px] font-semibold">
                <Link to="/" className="hover:text-foreground">
                  Главная
                </Link>
                <ChevronRight className="size-3.5" />
                <span className="text-foreground">Диагностика</span>
              </nav>

              <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center">
                <div>
                  <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
                    {hero.title}
                  </h1>
                  {hero.subtitle && (
                    <p className="text-muted-foreground mt-5 max-w-2xl text-[17px] leading-relaxed sm:text-[19px]">
                      {hero.subtitle}
                    </p>
                  )}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[16px] font-extrabold transition-colors"
                    >
                      <CalendarCheck className="size-5" strokeWidth={2.2} />
                      {hero.primary_label ?? "Записаться на диагностику"}
                    </a>
                    {hero.secondary_label && hero.secondary_url && (
                      <a
                        href={hero.secondary_url}
                        className="border-border text-foreground hover:border-primary/50 inline-flex items-center gap-2 rounded-2xl border px-6 py-3.5 text-[16px] font-extrabold transition-colors"
                      >
                        {hero.secondary_label}
                      </a>
                    )}
                  </div>
                </div>

                {hero.image_url && (
                  <div className="overflow-hidden rounded-[2rem]">
                    <img
                      src={hero.image_url}
                      alt={hero.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {navigator && (
          <SymptomNavigator
            title={navigator.title}
            subtitle={navigator.subtitle}
            note={navigator.body}
            symptoms={symptoms}
          />
        )}

        {catalog && (
          <section id="catalog" className="border-border border-b">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
              <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-[42px]">
                {catalog.title}
              </h2>
              {catalog.subtitle && (
                <p className="text-muted-foreground mt-3 max-w-3xl text-[17px] leading-relaxed">
                  {catalog.subtitle}
                </p>
              )}

              {categories.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className={cn(
                      "rounded-full px-5 py-2.5 text-[15px] font-bold transition-colors",
                      activeCategory === null
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-soft text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Все направления
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategory(category.key)}
                      className={cn(
                        "rounded-full px-5 py-2.5 text-[15px] font-bold transition-colors",
                        activeCategory === category.key
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-soft text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                  <Reveal key={item.id} className="h-full">
                    <Link
                      to="/diagnostika/$slug"
                      params={{ slug: item.slug }}
                      className="group border-border bg-card hover:border-primary/40 flex h-full flex-col rounded-[1.75rem] border p-6 transition-all hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <DiagnosticsIcon
                          icon={item.icon}
                          imageUrl={item.image_url}
                          title={item.title}
                        />
                        {item.badge && (
                          <span className="bg-surface-red text-foreground rounded-full px-3 py-1 text-[12px] font-extrabold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-foreground mt-5 text-[21px] leading-tight font-extrabold tracking-tight">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-muted-foreground mt-2.5 text-[15px] leading-snug font-medium">
                          {item.subtitle}
                        </p>
                      )}
                      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                        <span className="text-primary text-[15px] font-extrabold">
                          {item.price ?? "Уточните стоимость"}
                        </span>
                        <ArrowRight className="text-primary size-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="text-muted-foreground mt-10 text-[16px]">
                  В этой категории пока нет исследований.
                </p>
              )}
            </div>
          </section>
        )}

        {advantages && (
          <section className="border-border border-b">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
              <div className="bg-surface-soft rounded-[2rem] px-6 py-10 sm:px-10 lg:py-14">
                <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-[38px]">
                  {advantages.title}
                </h2>
                {advantages.subtitle && (
                  <p className="text-muted-foreground mt-4 max-w-3xl text-[17px] leading-relaxed">
                    {advantages.subtitle}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {cta && (
          <section>
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
              <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-[38px]">
                {cta.title}
              </h2>
              {cta.subtitle && (
                <p className="text-muted-foreground mt-3 max-w-2xl text-[17px] leading-relaxed">
                  {cta.subtitle}
                </p>
              )}
              <a
                href={cta.primary_url || BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent text-accent-foreground hover:bg-accent/90 mt-7 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[16px] font-extrabold transition-colors"
              >
                <CalendarCheck className="size-5" strokeWidth={2.2} />
                {cta.primary_label ?? "Записаться онлайн"}
              </a>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
