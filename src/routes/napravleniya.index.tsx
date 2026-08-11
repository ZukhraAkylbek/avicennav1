import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl } from "@/lib/clinic";
import { specialtiesQueryOptions } from "@/lib/specialties.queries";

const TITLE = "Направления клиники «Авиценна» в Бишкеке";
const DESCRIPTION =
  "Все направления клиники «Авиценна» в Бишкеке: урология, гастроэнтерология, кардиология, неврология, хирургия, педиатрия и другие. Онлайн-запись к врачу.";

export const Route = createFileRoute("/napravleniya/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(specialtiesQueryOptions());
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/napravleniya") || "/napravleniya" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/napravleniya") || "/napravleniya" }],
  }),
  component: SpecialtiesPage,
});

function SpecialtiesPage() {
  const { data: specialties } = useSuspenseQuery(specialtiesQueryOptions());

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main>
        <section className="border-border border-b">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <p className="eyebrow">Направления</p>
            <h1 className="text-foreground mt-3 max-w-3xl text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-6xl">
              Направления клиники «Авиценна»
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-lg sm:text-xl">
              Выберите направление, чтобы узнать о врачах, диагностике и записаться на приём.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((item, index) => (
              <Link
                key={item.slug}
                to="/napravleniya/$slug"
                params={{ slug: item.slug }}
                className="group border-border hover:bg-surface-soft flex flex-col gap-6 border p-6 transition-colors sm:p-7"
              >
                <span className="text-muted-foreground text-xs font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="text-foreground group-hover:text-brand-green block text-xl font-bold transition-colors sm:text-2xl">
                    {item.name}
                  </span>
                  <span className="text-muted-foreground mt-2 block text-base">
                    {item.h1_title}
                  </span>
                  <span className="text-brand-green mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                    Подробнее
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

