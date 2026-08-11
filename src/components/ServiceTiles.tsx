import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { specialtiesQueryOptions } from "@/lib/specialties.queries";

export function ServiceTiles() {
  const { data: specialties } = useSuspenseQuery(specialtiesQueryOptions());

  return (
    <section id="napravleniya" className="border-border border-t py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Направления"
          title="Медицинские направления клиники"
          description="Полный цикл помощи: от приёма терапевта до операций и стационара — в сети клиник «Авиценна»."
          action={
            <Link
              to="/napravleniya"
              className="text-foreground hover:text-brand-green text-base font-semibold whitespace-nowrap"
            >
              Все направления →
            </Link>
          }
        />

        <div className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {specialties.map((tile, index) => (
            <Reveal key={tile.slug} delay={(index % 4) * 80}>
            <Link
              to="/napravleniya/$slug"
              params={{ slug: tile.slug }}
              className="group card-lift border-border hover:border-brand-green hover:bg-surface-green flex h-full flex-col justify-between gap-8 border p-6 sm:p-7"
            >
              <span className="text-muted-foreground text-xs font-semibold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="text-foreground group-hover:text-brand-green block text-xl font-bold transition-colors sm:text-2xl">
                  {tile.name}
                </span>
                {tile.intro && (
                  <span className="text-muted-foreground mt-2 line-clamp-2 block text-sm">
                    {tile.intro}
                  </span>
                )}
                <span className="text-brand-green mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                  Подробнее
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
