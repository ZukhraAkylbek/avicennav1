import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Editable } from "@/components/live-edit/LiveEdit";
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
  "group card-lift bg-surface-soft hover:bg-surface-green flex min-h-[112px] flex-col justify-between gap-3 rounded-2xl p-4 text-[18px] leading-tight font-bold sm:p-5 sm:text-[21px]";

function Inner({ label, index }: { label: string; index: number }) {
  return (
    <>
      <Editable
        ekey={`quick.item_${index + 1}`}
        label={`Плашка ${index + 1}`}
        fallback={label}
        as="span"
        className="text-foreground group-hover:text-brand-green block break-words transition-colors"
      />
      <span className="bg-brand-green text-brand-white grid size-8 shrink-0 place-items-center self-end rounded-full transition-transform duration-300 group-hover:translate-x-0.5 sm:size-9">
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
          <Editable ekey="quick.eyebrow" label="Надзаголовок" fallback="Быстрый доступ" as="p" className="eyebrow" />
          <Editable
            ekey="quick.title"
            label="Заголовок блока"
            fallback="Что вас интересует?"
            as="h2"
            className="text-foreground mt-3 block text-3xl font-extrabold sm:text-4xl"
          />
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ITEMS.map((item, index) => (
            <Reveal key={item.label} delay={index * 60}>
              {item.slug ? (
                <Link to="/napravleniya/$slug" params={{ slug: item.slug }} className={CLASS}>
                  <Inner label={item.label} index={index} />
                </Link>
              ) : (
                <a href={item.href ?? "#napravleniya"} className={CLASS}>
                  <Inner label={item.label} index={index} />
                </a>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
