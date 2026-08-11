import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { specialtiesQueryOptions } from "@/lib/specialties.queries";

export function ServiceTiles() {
  const { data: specialties } = useSuspenseQuery(specialtiesQueryOptions());

  return (
    <section id="services" className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-brand-green-dark text-3xl font-extrabold sm:text-4xl">
          Сеть многопрофильных клиник «Авиценна»
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-lg sm:text-xl">
          Полный цикл помощи: от приёма терапевта до операций и стационара.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((tile) => (
            <Link
              key={tile.slug}
              to="/napravleniya/$slug"
              params={{ slug: tile.slug }}
              className={`${tile.tile_color} group flex items-center justify-between gap-3 rounded-3xl p-5 transition-transform hover:-translate-y-1 sm:p-6`}
            >
              <span className="bg-brand-green-dark text-brand-white rounded-2xl px-5 py-3 text-xl font-bold sm:text-2xl">
                {tile.name}
              </span>
              <ChevronRight
                className="text-brand-green-dark size-7 shrink-0 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
