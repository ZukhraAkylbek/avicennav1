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
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-brand-green-dark text-4xl font-extrabold sm:text-5xl">
          Направления клиники «Авиценна»
        </h1>
        <p className="text-muted-foreground mt-4 max-w-3xl text-xl">
          Выберите направление, чтобы узнать о врачах, диагностике и записаться на приём.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((item) => (
            <Link
              key={item.slug}
              to="/napravleniya/$slug"
              params={{ slug: item.slug }}
              className={`${item.tile_color} group flex flex-col gap-3 rounded-3xl p-6 transition-transform hover:-translate-y-1`}
            >
              <span className="bg-brand-green-dark text-brand-white inline-flex w-fit items-center gap-2 rounded-2xl px-5 py-3 text-xl font-bold sm:text-2xl">
                {item.name}
                <ChevronRight className="size-6" aria-hidden="true" />
              </span>
              <span className="text-brand-green-dark/90 text-lg">{item.h1_title}</span>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
