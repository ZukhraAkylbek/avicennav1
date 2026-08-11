import { ArrowRight, MapPin } from "lucide-react";

const LINKS = [
  { label: "Специалисты", bg: "bg-tile-mint" },
  { label: "Диагностика", bg: "bg-tile-sky" },
  { label: "Анализы", bg: "bg-tile-cream" },
  { label: "Заболевания", bg: "bg-tile-peach" },
  { label: "Симптомы", bg: "bg-tile-lilac" },
  { label: "Цены", bg: "bg-tile-sand" },
];

export function QuickLinksAndBranches() {
  return (
    <section id="patients" className="bg-background py-10 sm:py-14">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href="#services"
              className={`${link.bg} group flex items-center justify-between gap-3 rounded-3xl p-6`}
            >
              <span className="text-brand-green-dark text-2xl font-extrabold">
                {link.label}
              </span>
              <span className="bg-brand-green text-brand-white flex size-11 items-center justify-center rounded-full transition-transform group-hover:translate-x-1">
                <ArrowRight className="size-5" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>

        <div id="contacts" className="relative overflow-hidden rounded-3xl">
          <iframe
            title="Филиалы клиники Авиценна в Бишкеке"
            src="https://www.openstreetmap.org/export/embed.html?bbox=74.52%2C42.80%2C74.68%2C42.90&amp;layer=mapnik"
            loading="lazy"
            className="h-[320px] w-full border-0 sm:h-full sm:min-h-[420px]"
          />
          <div className="absolute top-5 left-5">
            <span className="bg-brand-green-dark text-brand-white rounded-2xl px-6 py-4 text-2xl font-extrabold">
              Найти филиал
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
