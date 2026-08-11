import { Link } from "@tanstack/react-router";

type QuickItem = {
  label: string;
  slug?: string;
};

const ITEMS: QuickItem[] = [
  { label: "Поликлиника" },
  { label: "Травмпункт 24/7", slug: "travmatolog" },
  { label: "Диагностика" },
  { label: "Хирургия", slug: "hirurg" },
  { label: "Лаборатория" },
  { label: "Стационар" },
  { label: "Урология", slug: "urolog" },
  { label: "Услуги на дому" },
  { label: "Чекапы" },
];

const TILE_CLASS =
  "bg-brand-green-dark text-brand-white flex min-h-[92px] items-center rounded-2xl px-5 py-4 text-xl font-bold leading-snug transition-colors duration-200 hover:bg-brand-green focus-visible:ring-4 focus-visible:ring-brand-green/40 focus-visible:outline-none sm:min-h-[104px] sm:text-[22px]";

export function QuickAccess() {
  return (
    <section
      id="quick-access"
      aria-labelledby="quick-access-title"
      className="bg-background py-8 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          id="quick-access-title"
          className="text-brand-green-dark text-2xl font-extrabold sm:text-3xl"
        >
          Быстрый доступ
        </h2>

        <div className="mt-5 grid max-h-[70vh] grid-cols-2 gap-3 overflow-y-auto sm:max-h-none sm:grid-cols-3 sm:gap-4 sm:overflow-visible lg:grid-cols-3">
          {ITEMS.map((item) =>
            item.slug ? (
              <Link
                key={item.label}
                to="/napravleniya/$slug"
                params={{ slug: item.slug }}
                className={TILE_CLASS}
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.label}
                to="/napravleniya"
                className={TILE_CLASS}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
