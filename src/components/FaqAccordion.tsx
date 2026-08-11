import { Plus } from "lucide-react";
import { useState } from "react";

import { SectionHeading } from "@/components/SectionHeading";
import { CLINIC } from "@/lib/clinic";

type Faq = { question: string; answer: string };

const DEFAULT_FAQS: Faq[] = [
  {
    question: "Нужно ли направление от врача?",
    answer: "Нет, вы можете записаться к любому специалисту напрямую — по телефону или онлайн.",
  },
  {
    question: "Можно ли пройти все обследования в клинике?",
    answer:
      "Да. УЗИ, лабораторные анализы, эндоскопия и функциональная диагностика доступны в одном месте.",
  },
  {
    question: "Работаете ли вы круглосуточно?",
    answer: "Травмпункт и стационар работают 24/7, поликлиника — по расписанию клиники.",
  },
  {
    question: "Принимаете ли вы страховые полисы?",
    answer: "Да, мы работаем с большинством страховых компаний. Уточните детали у администратора.",
  },
];

export function FaqAccordion({ faqs }: { faqs?: Faq[] }) {
  const items = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="border-border border-t py-14 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="FAQ"
            title="Часто задаваемые вопросы"
            description="Если не нашли ответ — позвоните нам или оставьте заявку, и мы ответим в течение 15 минут."
          />
          <div className="border-border mt-8 rounded-lg border p-6">
            <p className="text-muted-foreground text-sm">Телефон клиники</p>
            <a
              href={`tel:${CLINIC.phones[0]}`}
              className="text-brand-green mt-1 block text-xl font-bold sm:text-2xl"
            >
              +996 779 909 009
            </a>
            <p className="text-muted-foreground mt-1 text-sm">
              Пн–Пт: 8:00–20:00 · Сб–Вс: 9:00–18:00
            </p>
          </div>
        </div>

        <dl className="space-y-3">
          {items.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className="border-border rounded-lg border">
                <dt>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-foreground text-base font-semibold sm:text-lg">
                      {faq.question}
                    </span>
                    <Plus
                      className={`text-muted-foreground size-5 shrink-0 transition-transform ${isOpen ? "rotate-45" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </dt>
                {isOpen && (
                  <dd className="text-muted-foreground border-border border-t px-5 py-4 text-base leading-relaxed">
                    {faq.answer}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
