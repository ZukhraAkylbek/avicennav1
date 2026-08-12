import { Editable } from "@/components/live-edit/LiveEdit";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

const ADVANTAGES = [
  {
    title: "Опытные врачи",
    text: "Специалисты с опытом от 12 лет, стажировки в клиниках Москвы, Санкт-Петербурга и Германии.",
  },
  {
    title: "Современные методики",
    text: "Лапароскопия, эндоскопия, малоинвазивные вмешательства — минимальный разрез и быстрое восстановление.",
  },
  {
    title: "Полное сопровождение",
    text: "Ведём пациента от первичного осмотра до реабилитации. Врач доступен для вопросов 24/7.",
  },
];

export function WhyUs({ title }: { title?: string }) {
  return (
    <section id="preimushchestva" className="border-border border-t py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          ekey="why"
          eyebrow="Преимущества"
          title={title ?? "Почему пациенты выбирают «Авиценну»"}
        />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {ADVANTAGES.map((item, index) => (
            <Reveal key={item.title} delay={index * 100} className="border-border border-t pt-6">
              <p className="text-muted-foreground text-sm font-semibold">
                0{index + 1}
              </p>
              <Editable
                ekey={`why.${index + 1}_title`}
                label={`Преимущество ${index + 1} — заголовок`}
                fallback={item.title}
                as="h3"
                className="text-foreground mt-3 block text-xl font-bold sm:text-2xl"
              />
              <Editable
                ekey={`why.${index + 1}_text`}
                label={`Преимущество ${index + 1} — текст`}
                fallback={item.text}
                multiline
                as="p"
                className="text-muted-foreground mt-3 text-base leading-relaxed"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
