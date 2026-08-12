import { CountUp } from "@/components/CountUp";
import { Editable } from "@/components/live-edit/LiveEdit";
import { Reveal } from "@/components/Reveal";

export type Stat = { value: string; suffix?: string; label: string };

export function StatsBand({ stats }: { stats: Stat[] }) {
  const tones = ["bg-surface-green", "bg-surface-red", "bg-surface-soft", "bg-surface-green"];

  return (
    <section aria-label="Клиника в цифрах" className="border-border border-y">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal
            key={stat.label}
            delay={index * 90}
            className={`${tones[index % tones.length]} border-border card-lift border-t px-5 py-9 text-center sm:px-6 sm:py-11 lg:border-t-0 lg:border-l lg:first:border-l-0`}
          >
            <p className="text-foreground text-4xl leading-none font-extrabold tabular-nums sm:text-5xl">
              <CountUp value={stat.value} />
              {stat.suffix &&
                (stat.suffix.trim().length <= 2 ? (
                  <span>{stat.suffix}</span>
                ) : (
                  <span className="mt-1 block text-lg font-bold sm:text-xl">{stat.suffix}</span>
                ))}
            </p>
            <Editable
              ekey={`stats.${index + 1}_label`}
              label={`Счётчик ${index + 1} — подпись`}
              fallback={stat.label}
              as="p"
              className="text-muted-foreground mt-2 text-sm font-medium sm:text-base"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
