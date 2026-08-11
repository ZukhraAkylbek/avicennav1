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

        <div className="mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((tile) => (
            <Link
              key={tile.slug}
              to="/napravleniya/$slug"
              params={{ slug: tile.slug }}
              className="group border-border flex items-center justify-between gap-3 border-b py-4 transition-colors hover:border-brand-green"
            >
              <span className="text-foreground group-hover:text-brand-green-dark text-xl font-bold sm:text-2xl">
                {tile.name}
              </span>
              <ChevronRight
                className="text-brand-green size-7 shrink-0 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
