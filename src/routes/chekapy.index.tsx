import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, ChevronRight } from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl } from "@/lib/clinic";
import { checkupPageQueryOptions } from "@/lib/checkups.queries";
import { BOOKING_URL } from "@/lib/site-config";

const TITLE = "Чекапы — комплексные программы обследования | Авиценна";
const DESCRIPTION =
  "Чекапы в клинике «Авиценна» в Бишкеке: мужской, женский, детский чекап и программы по диабету. Комплексная диагностика, результаты в день обращения.";

export const Route = createFileRoute("/chekapy/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(checkupPageQueryOptions());
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/chekapy") || "/chekapy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/chekapy") || "/chekapy" }],
  }),
  component: CheckupsPage,
});

function CheckupsPage() {
  const { data } = useSuspenseQuery(checkupPageQueryOptions());
  const sections = data.sections;
  const cards = data.cards;

  const hero = sections.find((s) => s.key === "hero");
  const flagship = sections.find((s) => s.key === "flagship");
  const rest = sections.filter((s) => s.key !== "hero" && s.key !== "flagship");

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-border border-b">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <nav className="text-muted-foreground flex items-center gap-1.5 text-[13px] font-semibold">
              <Link to="/" className="hover:text-foreground">
                Главная
              </Link>
              <ChevronRight className="size-3.5" />
              <span className="text-foreground">Чекапы</span>
            </nav>
            <h1 className="text-foreground mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              {hero?.title === "Hero" ? "Чекапы" : (hero?.title ?? "Чекапы")}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl text-[17px] leading-relaxed">
              {hero?.subtitle ??
                "Комплексные программы для ранней диагностики и контроля здоровья. Выберите подходящий чекап и пройдите обследование с заботой о себе."}
            </p>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-7 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[16px] font-extrabold transition-colors"
            >
              <CalendarCheck className="size-5" strokeWidth={2.2} />
              Записаться на чекап
            </a>
          </div>
        </section>

        {/* Флагманские чекапы — баннер с карточками */}
        <section id="flagship" className="border-border border-b">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <p className="eyebrow">Программы</p>
            <h2 className="text-foreground mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {flagship?.title ?? "Флагманские чекапы"}
            </h2>
            {flagship?.subtitle && (
              <p className="text-muted-foreground mt-3 max-w-2xl text-[16px] leading-relaxed">
                {flagship.subtitle}
              </p>
            )}

            <div className="mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card, index) => (
                <Reveal key={card.id} className="h-full">
                  <Link
                    to="/chekapy/$slug"
                    params={{ slug: card.slug }}
                    className="border-border bg-card hover:border-primary/40 group flex h-full flex-col overflow-hidden rounded-3xl border transition-all hover:shadow-lg"
                  >
                    <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden">
                      {card.image_url ? (
                        <img
                          src={card.image_url}
                          alt={card.title}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <span className="text-muted-foreground grid size-full place-items-center text-[13px] font-semibold">
                          Фото программы
                        </span>
                      )}
                      <span className="text-primary bg-background/95 absolute top-4 left-4 rounded-full px-3 py-1 text-[12px] font-extrabold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      {card.badge && (
                        <span className="text-primary bg-primary/10 mb-3 w-fit rounded-full px-3 py-1 text-[12px] font-bold">
                          {card.badge}
                        </span>
                      )}
                      <h3 className="text-foreground text-[20px] leading-snug font-extrabold break-words">
                        {card.title}
                      </h3>
                      {card.subtitle && (
                        <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
                          {card.subtitle}
                        </p>
                      )}
                      <span className="mt-auto flex items-center justify-between gap-3 pt-5">
                        {card.price && (
                          <span className="text-foreground text-[18px] font-extrabold">
                            {card.price}
                          </span>
                        )}
                        <span className="text-primary flex items-center gap-1.5 text-[14px] font-bold">
                          Подробнее
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Остальные разделы страницы */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((section) => (
                <Reveal key={section.id} className="h-full">
                  <article
                    id={section.key}
                    className="border-border bg-card h-full rounded-3xl border p-6"
                  >
                    <h2 className="text-foreground text-[20px] font-extrabold">{section.title}</h2>
                    {section.subtitle && (
                      <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                        {section.subtitle}
                      </p>
                    )}
                    {section.body && (
                      <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed whitespace-pre-line">
                        {section.body}
                      </p>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
