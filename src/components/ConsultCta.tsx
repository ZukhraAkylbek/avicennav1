import { Check } from "lucide-react";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SectionHeading } from "@/components/SectionHeading";
import { BOOKING_URL } from "@/lib/site-config";
import { specialtiesQueryOptions } from "@/lib/specialties.queries";

const BENEFITS = [
  "Первичная консультация без ожидания",
  "Приём по записи, без очереди",
  "Все специалисты в одном месте",
];

export function ConsultCta({ defaultSlug }: { defaultSlug?: string }) {
  const { data: specialties } = useSuspenseQuery(specialtiesQueryOptions());
  const [sent, setSent] = useState(false);

  return (
    <section id="zapis" className="border-border bg-surface-soft border-t py-14 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Консультация"
            title="Нужна консультация врача?"
            description="Оставьте заявку — администратор перезвонит в течение 15 минут и подберёт удобное время."
          />
          <ul className="mt-8 space-y-3">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="bg-surface-green text-brand-green grid size-6 shrink-0 place-items-center rounded-full">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <span className="text-foreground text-base">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <form
          className="bg-background border-border rounded-lg border p-6 sm:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <p className="text-foreground text-lg font-bold">Форма записи</p>

          <label className="mt-5 block">
            <span className="text-muted-foreground text-sm">Ваше имя</span>
            <input
              required
              name="name"
              className="border-border focus:border-foreground mt-1.5 w-full rounded-md border px-4 py-3 text-base outline-none"
              placeholder="Как к вам обращаться"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-muted-foreground text-sm">Номер телефона</span>
            <input
              required
              type="tel"
              name="phone"
              className="border-border focus:border-foreground mt-1.5 w-full rounded-md border px-4 py-3 text-base outline-none"
              placeholder="+996 ___ ___ ___"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-muted-foreground text-sm">Направление</span>
            <select
              name="specialty"
              defaultValue={defaultSlug ?? ""}
              className="border-border focus:border-foreground mt-1.5 w-full rounded-md border bg-transparent px-4 py-3 text-base outline-none"
            >
              <option value="">Выберите направление</option>
              {specialties.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="bg-accent text-accent-foreground mt-6 w-full rounded-md px-6 py-4 text-base font-semibold transition-opacity hover:opacity-90"
          >
            {sent ? "Заявка отправлена" : "Отправить заявку"}
          </button>

          <p className="text-muted-foreground mt-3 text-xs">
            Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности. Или{" "}
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-green font-semibold underline"
            >
              запишитесь онлайн
            </a>
            .
          </p>
        </form>
      </div>
    </section>
  );
}
