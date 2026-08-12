import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/Reveal";

type QuickItem = { label: string; slug?: string; href?: string };

const ITEMS: QuickItem[] = [
  { label: "Поликлиника", href: "#napravleniya" },
  { label: "Травмпункт 24/7", slug: "travmatolog" },
  { label: "Диагностика", href: "#preimushchestva" },
  { label: "Хирургия", slug: "hirurg" },
  { label: "Лаборатория", href: "#uslugi" },
  { label: "Стационар", href: "#uslugi" },
  { label: "Урология", slug: "urolog" },
  { label: "Услуги на дому", href: "#uslugi" },
  { label: "Чекапы", href: "#process" },
];

const CLASS =
  "group card-lift bg-surface-soft hover:bg-surface-green flex min-h-[104px] items-end justify-between gap-3 rounded-2xl p-5 text-[21px] leading-tight font-bold sm:text-[22px]";

function Inner({ label }: { label: string }) {
  return (
    <>
      <span className="text-foreground group-hover:text-brand-green transition-colors">
        {label}
      </span>
      <span className="bg-brand-green text-brand-white grid size-9 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5">
        <ArrowRight className="size-4" />
      </span>
    </>
  );
}

export function QuickAccess() {
  return (
    <section id="uslugi" className="border-border border-t py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="eyebrow">Быстрый доступ</p>
          <h2 className="text-foreground mt-3 text-3xl font-extrabold sm:text-4xl">
            Что вас интересует?
          </h2>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ITEMS.map((item, index) => (
            <Reveal key={item.label} delay={index * 60}>
              {item.slug ? (
                <Link to="/napravleniya/$slug" params={{ slug: item.slug }} className={CLASS}>
                  <Inner label={item.label} />
                </Link>
              ) : (
                <a href={item.href ?? "#napravleniya"} className={CLASS}>
                  <Inner label={item.label} />
                </a>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
