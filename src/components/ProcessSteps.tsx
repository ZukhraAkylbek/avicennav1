import { SectionHeading } from "@/components/SectionHeading";

const STEPS = [
  { title: "Консультация", text: "Осмотр врача, сбор анамнеза, предварительный диагноз." },
  { title: "Диагностика", text: "УЗИ, анализы, КТ или МРТ — всё в одной клинике." },
  { title: "План лечения", text: "Врач объясняет метод, риски и каждый этап лечения." },
  { title: "Лечение", text: "Процедуры и операции в оснащённых кабинетах и операционных." },
  { title: "Наблюдение", text: "Контрольные осмотры, перевязки и анализы в клинике." },
  { title: "Восстановление", text: "Индивидуальный план реабилитации и поддержка врача." },
];

export function ProcessSteps({ title }: { title?: string }) {
  return (
    <section id="process" className="border-border border-t py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Процесс" title={title ?? "Как проходит лечение"} />

        <ol className="mt-10 space-y-0">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
              <span
                className="border-border absolute top-9 bottom-0 left-[15px] w-px border-l last:hidden"
                aria-hidden="true"
              />
              <span className="bg-brand-green text-brand-white relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold">
                0{index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-foreground text-lg font-bold sm:text-xl">{step.title}</h3>
                <p className="text-muted-foreground mt-1 text-base">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
