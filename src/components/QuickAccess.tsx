import { Link } from "@tanstack/react-router";

type QuickItem = { label: string; slug?: string };

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

const CLASS =
  "group border-border hover:border-brand-green hover:bg-surface-green flex min-h-[76px] items-center rounded-md border px-4 py-4 text-[19px] leading-tight font-semibold transition-colors sm:text-xl";

export function QuickAccess() {
  return (
    <section id="uslugi" className="border-border border-t py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="eyebrow">Быстрый доступ</p>
        <h2 className="text-foreground mt-3 text-3xl font-extrabold sm:text-4xl">
          Разделы клиники
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ITEMS.map((item) =>
            item.slug ? (
              <Link
                key={item.label}
                to="/napravleniya/$slug"
                params={{ slug: item.slug }}
                className={CLASS}
              >
                <span className="text-foreground group-hover:text-brand-green transition-colors">
                  {item.label}
                </span>
              </Link>
            ) : (
              <a key={item.label} href="#napravleniya" className={CLASS}>
                <span className="text-foreground group-hover:text-brand-green transition-colors">
                  {item.label}
                </span>
              </a>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
