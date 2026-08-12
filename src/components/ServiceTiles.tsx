import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { specialtyImage } from "@/lib/specialty-images";
import { specialtiesQueryOptions } from "@/lib/specialties.queries";

export function ServiceTiles() {
  const { data: specialties } = useSuspenseQuery(specialtiesQueryOptions());

  return (
    <section id="napravleniya" className="border-border border-t py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Направления"
          title="Разделы клиники"
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

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((tile, index) => (
            <Reveal key={tile.slug} delay={(index % 3) * 80}>
              <Link
                to="/napravleniya/$slug"
                params={{ slug: tile.slug }}
                className="group card-lift bg-surface-soft hover:bg-surface-green flex h-full flex-col justify-between gap-4 overflow-hidden rounded-2xl p-6 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-foreground group-hover:text-brand-green block max-w-[60%] text-2xl leading-tight font-extrabold transition-colors sm:text-[26px]">
                    {tile.name}
                  </span>
                  <img
                    src={specialtyImage(tile.slug, index)}
                    alt={tile.name}
                    width={768}
                    height={768}
                    loading="lazy"
                    className="size-24 shrink-0 rounded-xl object-contain transition-transform duration-500 group-hover:scale-105 sm:size-28"
                  />
                </div>
                <div>
                  {tile.intro && (
                    <span className="text-muted-foreground line-clamp-2 block text-sm">
                      {tile.intro}
                    </span>
                  )}
                  <span className="text-brand-green mt-4 inline-flex items-center gap-1 text-sm font-bold">
                    Подробнее
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
