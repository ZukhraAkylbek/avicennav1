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

export const Route = createFileRoute("/checkups/")({
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
      { property: "og:url", content: absoluteUrl("/checkups") || "/checkups" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/checkups") || "/checkups" }],
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
            <div className="bg-surface-soft rounded-[2rem] px-4 py-10 sm:px-8 lg:px-10 lg:py-14">
              <h2 className="text-foreground text-center text-3xl font-extrabold tracking-tight sm:text-[42px]">
                {(() => {
                  const title = flagship?.title ?? "Флагманские чекапы";
                  const words = title.split(" ");
                  const last = words.pop();
                  return (
                    <>
                      {words.join(" ")}{" "}
                      <span className="bg-surface-red text-foreground inline-block rounded-full px-4 py-1">
                        {last}
                      </span>
                    </>
                  );
                })()}
              </h2>
              {flagship?.subtitle && (
                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-[16px] leading-relaxed">
                  {flagship.subtitle}
                </p>
              )}

              <div className="mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-6">
                {cards.map((card, index) => {
                  const wide = index < 2;
                  const arcRed = index % 2 === 1;
                  return (
                    <Reveal
                      key={card.id}
                      className={`h-full ${wide ? "lg:col-span-3" : "lg:col-span-2"}`}
                    >
                      <Link
                        to="/checkups/$slug"
                        params={{ slug: card.slug }}
                        className="group bg-card relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-6 transition-shadow hover:shadow-xl sm:p-7"
                      >
                        {/* декоративная дуга */}
                        <span
                          aria-hidden
                          className={`pointer-events-none absolute bottom-[-38%] left-[-8%] z-0 size-[58%] rounded-full border-[22px] opacity-70 ${
                            arcRed ? "border-surface-red" : "border-brand-green/30"
                          }`}
                        />

                        <div className="relative z-10 flex flex-1 gap-4">
                          <div className="flex min-w-0 flex-1 flex-col">
                            <h3 className="text-foreground text-[24px] leading-[1.1] font-extrabold tracking-tight break-words sm:text-[28px]">
                              {card.title}
                            </h3>
                            {card.subtitle && (
                              <p className="text-muted-foreground mt-3 text-[14px] leading-snug font-semibold">
                                {card.subtitle}
                              </p>
                            )}
                            {card.price && (
                              <p className="text-foreground mt-2 text-[15px] font-extrabold">
                                {card.price}
                              </p>
                            )}
                            <span className="mt-6 flex flex-wrap items-center gap-3 pt-2">
                              {card.badge && (
                                <span className="text-muted-foreground text-[13px] font-semibold">
                                  {card.badge}
                                </span>
                              )}
                              <span className="bg-brand-green-dark text-brand-white inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-extrabold transition-transform group-hover:-translate-y-0.5">
                                Подробнее
                                <ArrowRight className="size-4" strokeWidth={2.4} />
                              </span>
                            </span>
                          </div>

                          {card.image_url && (
                            <img
                              src={card.image_url}
                              alt={card.title}
                              loading="lazy"
                              className="relative -mr-2 -mb-8 hidden w-[42%] max-w-[220px] self-end object-contain sm:block"
                            />
                          )}
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
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
