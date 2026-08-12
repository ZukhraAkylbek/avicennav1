import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { CalendarCheck, ChevronRight } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl } from "@/lib/clinic";
import { checkupCardQueryOptions } from "@/lib/checkups.queries";
import { BOOKING_URL } from "@/lib/site-config";

export const Route = createFileRoute("/checkups/$slug")({
  loader: async ({ context, params }) => {
    const card = await context.queryClient.ensureQueryData(checkupCardQueryOptions(params.slug));
    if (!card) throw notFound();
    return { card };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Программа не найдена" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.card.title} — чекап в клинике «Авиценна»`;
    const description =
      loaderData.card.subtitle ??
      "Комплексная программа обследования в клинике «Авиценна» в Бишкеке.";
    const url = absoluteUrl(`/checkups/${loaderData.card.slug}`) || `/checkups/${loaderData.card.slug}`;
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
  errorComponent: () => <CheckupFallback text="Не удалось загрузить программу." />,
  notFoundComponent: () => <CheckupFallback text="Такой программы чекапа нет." />,
  component: CheckupCardPage,
});

function CheckupFallback({ text }: { text: string }) {
  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-foreground text-3xl font-extrabold">{text}</h1>
        <Link to="/checkups" className="text-primary mt-5 inline-block text-[15px] font-bold">
          Все чекапы
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function CheckupCardPage() {
  const { slug } = Route.useParams();
  const { data: card } = useSuspenseQuery(checkupCardQueryOptions(slug));

  if (!card) return <CheckupFallback text="Такой программы чекапа нет." />;

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main>
        <section className="border-border border-b">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:py-16">
            <div>
              <nav className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px] font-semibold">
                <Link to="/" className="hover:text-foreground">
                  Главная
                </Link>
                <ChevronRight className="size-3.5" />
                <Link to="/checkups" className="hover:text-foreground">
                  Чекапы
                </Link>
                <ChevronRight className="size-3.5" />
                <span className="text-foreground">{card.title}</span>
              </nav>
              {card.badge && (
                <span className="text-primary bg-primary/10 mt-5 inline-block rounded-full px-3 py-1 text-[13px] font-bold">
                  {card.badge}
                </span>
              )}
              <h1 className="text-foreground mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {card.title}
              </h1>
              {card.subtitle && (
                <p className="text-muted-foreground mt-4 max-w-2xl text-[17px] leading-relaxed">
                  {card.subtitle}
                </p>
              )}
              {card.price && (
                <p className="text-primary mt-6 text-3xl font-extrabold">{card.price}</p>
              )}
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[16px] font-extrabold transition-colors"
              >
                <CalendarCheck className="size-5" strokeWidth={2.2} />
                Записаться на чекап
              </a>
            </div>
            <div className="bg-muted aspect-[4/3] overflow-hidden rounded-3xl">
              {card.image_url ? (
                <img src={card.image_url} alt={card.title} className="size-full object-cover" />
              ) : (
                <span className="text-muted-foreground grid size-full place-items-center text-[13px] font-semibold">
                  Фото программы
                </span>
              )}
            </div>
          </div>
        </section>

        {card.body && (
          <section>
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
              <h2 className="text-foreground text-2xl font-extrabold sm:text-3xl">
                Что входит в программу
              </h2>
              <p className="text-muted-foreground mt-4 text-[16px] leading-relaxed whitespace-pre-line">
                {card.body}
              </p>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
