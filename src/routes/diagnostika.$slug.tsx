import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import {
  Activity,
  CalendarCheck,
  ChevronRight,
  Clock,
  MapPin,
  Microscope,
  Plus,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { DiagnosticsIcon } from "@/components/DiagnosticsIcon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CLINIC, absoluteUrl } from "@/lib/clinic";
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
      return {
        meta: [{ title: "Исследование не найдено" }, { name: "robots", content: "noindex" }],
      };
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

/** Разбор строк вида «Название | описание» из текстовых полей админки. */
function parsePairs(value: string | null | undefined): Array<{ title: string; text: string }> {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: (title ?? "").trim(), text: rest.join("|").trim() };
    })
    .filter((entry) => entry.title.length > 0);
}

const BOOK_BTN =
  "bg-accent text-accent-foreground hover:bg-accent/90 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[16px] font-extrabold transition-colors";

const ADVANTAGE_ICONS = [ShieldCheck, Microscope, Stethoscope, UserRound, Activity, Clock];

const DEFAULT_ADVANTAGES = [
  { title: "Экспертное оборудование", text: "Современные аппараты и точные протоколы исследования." },
  { title: "Опытные врачи", text: "Диагносты с многолетней практикой и профильной специализацией." },
  { title: "Быстрое заключение", text: "Результат и расшифровку получаете в день обращения." },
  { title: "Без очередей", text: "Запись на удобное время в любом филиале сети." },
];

const DEFAULT_SCHEDULE = [
  { title: "Пн — Пт", text: "08:00 — 20:00" },
  { title: "Сб — Вс", text: "09:00 — 18:00" },
];

function DiagnosticsItemPage() {
  const { slug } = Route.useParams();
  const { data: item } = useSuspenseQuery(diagnosticsItemQueryOptions(slug));
  if (!item) return <Fallback title="Исследование не найдено" />;

  const kinds = parsePairs(item.kinds).length
    ? parsePairs(item.kinds)
    : (item.includes ?? "")
        .split(/[,\n]/)
        .map((v) => v.trim())
        .filter(Boolean)
        .map((title) => ({ title, text: "" }));

  const advantages = parsePairs(item.advantages).length
    ? parsePairs(item.advantages)
    : DEFAULT_ADVANTAGES;
  const schedule = parsePairs(item.schedule).length ? parsePairs(item.schedule) : DEFAULT_SCHEDULE;
  const faq = parsePairs(item.faq);

  const jsonLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((entry) => ({
          "@type": "Question",
          name: entry.title,
          acceptedAnswer: { "@type": "Answer", text: entry.text },
        })),
      }
    : null;

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-border border-b">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
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

            <div className="mt-6 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
              <div>
                <DiagnosticsIcon
                  icon={item.icon}
                  title={item.title}
                  className="size-12 rounded-2xl"
                />
                <h1 className="text-foreground mt-5 text-[30px] leading-[1.08] font-extrabold tracking-tight sm:text-5xl">
                  {item.title} в Бишкеке
                </h1>
                {item.subtitle && (
                  <p className="text-muted-foreground mt-4 max-w-2xl text-[16px] leading-relaxed sm:text-[19px]">
                    {item.subtitle}
                  </p>
                )}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={BOOK_BTN}>
                    <CalendarCheck className="size-5" strokeWidth={2.2} />
                    Записаться
                  </a>
                  {item.price && (
                    <span className="bg-surface-soft text-foreground rounded-2xl px-5 py-3 text-[17px] font-extrabold">
                      {item.price}
                    </span>
                  )}
                </div>
                {item.hero_note && (
                  <p className="text-muted-foreground mt-4 text-[14px] font-semibold">
                    {item.hero_note}
                  </p>
                )}
              </div>

              {item.image_url && (
                <div className="bg-surface-soft relative overflow-hidden rounded-[2rem] p-6">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="mx-auto h-40 w-auto object-contain sm:h-56"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* О процедуре */}
        {item.body && (
          <section className="border-border border-b">
            <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
              <h2 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-[34px]">
                О процедуре
              </h2>
              <p className="text-muted-foreground mt-4 max-w-3xl text-[16px] leading-relaxed whitespace-pre-line sm:text-[18px]">
                {item.body}
              </p>
              {item.preparation && (
                <div className="bg-surface-soft mt-6 max-w-3xl rounded-3xl p-6">
                  <p className="text-foreground text-[17px] font-extrabold">Подготовка</p>
                  <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed whitespace-pre-line">
                    {item.preparation}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Почему выбирают Авиценну */}
        <section className="border-border border-b">
          <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:py-16">
            <h2 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-[34px]">
              Почему выбирают «Авиценну»
            </h2>
            <div className="mt-6 grid auto-rows-fr gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
              {advantages.map((entry, index) => {
                const Icon = ADVANTAGE_ICONS[index % ADVANTAGE_ICONS.length]!;
                return (
                  <div
                    key={entry.title}
                    className="border-border bg-card flex h-full flex-col rounded-3xl border p-5 transition-shadow hover:shadow-lg sm:p-6"
                  >
                    <span className="bg-primary/10 text-primary grid size-11 place-items-center rounded-2xl">
                      <Icon className="size-5.5" strokeWidth={2.2} />
                    </span>
                    <p className="text-foreground mt-4 text-[17px] leading-tight font-extrabold">
                      {entry.title}
                    </p>
                    {entry.text && (
                      <p className="text-muted-foreground mt-2 text-[14px] leading-snug font-medium">
                        {entry.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Виды исследования */}
        {kinds.length > 0 && (
          <section className="border-border border-b">
            <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:py-16">
              <h2 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-[34px]">
                Виды исследования
              </h2>
              <div className="mt-6 grid auto-rows-fr gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
                {kinds.map((kind) => (
                  <div
                    key={kind.title}
                    className="border-border bg-card flex h-full flex-col rounded-3xl border p-5 sm:p-6"
                  >
                    <p className="text-foreground text-[18px] leading-tight font-extrabold">
                      {kind.title}
                    </p>
                    {kind.text && (
                      <p className="text-primary mt-2 text-[15px] font-extrabold">{kind.text}</p>
                    )}
                    <a
                      href={BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground mt-auto inline-flex items-center gap-2 self-start rounded-xl px-4 py-2.5 pt-2.5 text-[14px] font-extrabold transition-colors"
                    >
                      Записаться
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Оффер */}
        <section className="border-border border-b">
          <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
            <div className="bg-primary text-primary-foreground rounded-[2rem] px-6 py-9 sm:px-10 sm:py-12">
              <h2 className="text-[26px] leading-tight font-extrabold tracking-tight sm:text-[36px]">
                {item.offer_title || `Запишитесь на ${item.title}`}
              </h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed opacity-90 sm:text-[18px]">
                {item.offer_text ||
                  "Свободное время есть уже сегодня — выберите удобный филиал и получите заключение врача в день исследования."}
              </p>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent text-accent-foreground hover:bg-accent/90 mt-7 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[16px] font-extrabold transition-colors"
              >
                <CalendarCheck className="size-5" strokeWidth={2.2} />
                Записаться онлайн
              </a>
            </div>
          </div>
        </section>

        {/* График работы */}
        <section className="border-border border-b">
          <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
            <h2 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-[34px]">
              График работы
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {schedule.map((entry) => (
                <div key={entry.title} className="bg-surface-soft rounded-3xl p-5 sm:p-6">
                  <span className="text-primary inline-flex items-center gap-2 text-[14px] font-extrabold">
                    <Clock className="size-4" strokeWidth={2.4} />
                    {entry.title}
                  </span>
                  <p className="text-foreground mt-2 text-[19px] font-extrabold">{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Филиалы */}
        <section className="border-border border-b">
          <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:py-16">
            <h2 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-[34px]">
              Где доступно исследование
            </h2>
            <div className="mt-6 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CLINIC.branches.map((branch) => (
                <div
                  key={branch.name}
                  className="border-border bg-card flex h-full flex-col rounded-3xl border p-5 sm:p-6"
                >
                  <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-xl">
                    <MapPin className="size-5" strokeWidth={2.2} />
                  </span>
                  <p className="text-foreground mt-4 text-[17px] leading-tight font-extrabold">
                    {branch.street}
                  </p>
                  <p className="text-muted-foreground mt-2 text-[14px] font-semibold">
                    {schedule.map((entry) => `${entry.title}: ${entry.text}`).join(" · ")}
                  </p>
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground mt-auto inline-flex items-center gap-2 self-start rounded-xl px-4 py-2.5 text-[14px] font-extrabold transition-colors"
                  >
                    Записаться
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="border-border border-b">
            <div className="mx-auto max-w-4xl px-4 py-9 sm:px-6 sm:py-12 lg:py-16">
              <h2 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-[34px]">
                Частые вопросы
              </h2>
              <div className="mt-6 space-y-3">
                {faq.map((entry) => (
                  <details
                    key={entry.title}
                    className="group border-border bg-card rounded-2xl border px-5 py-4"
                  >
                    <summary className="text-foreground flex cursor-pointer list-none items-start justify-between gap-4 text-[16px] leading-snug font-extrabold">
                      {entry.title}
                      <span className="bg-primary/10 text-primary grid size-7 shrink-0 place-items-center rounded-full transition-transform group-open:rotate-45">
                        <Plus className="size-4" strokeWidth={2.6} />
                      </span>
                    </summary>
                    <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed whitespace-pre-line">
                      {entry.text}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SEO-блок */}
        {(item.seo_text || item.seo_heading) && (
          <section className="border-border border-b">
            <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
              <h2 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-[30px]">
                {item.seo_heading || `Где сделать ${item.title} в Бишкеке?`}
              </h2>
              {item.seo_text && (
                <p className="text-muted-foreground mt-4 max-w-4xl text-[15px] leading-relaxed whitespace-pre-line sm:text-[17px]">
                  {item.seo_text}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Финальный CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
            <h2 className="text-foreground text-[26px] leading-tight font-extrabold tracking-tight sm:text-[36px]">
              Записаться на {item.title}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl text-[16px] leading-relaxed sm:text-[18px]">
              Онлайн-запись занимает меньше минуты. Мы подтвердим время и напомним о визите.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={BOOK_BTN}>
                <CalendarCheck className="size-5" strokeWidth={2.2} />
                Записаться онлайн
              </a>
              <Link to="/diagnostika" className="text-primary text-[16px] font-extrabold">
                Все исследования
              </Link>
            </div>
          </div>
        </section>

        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
