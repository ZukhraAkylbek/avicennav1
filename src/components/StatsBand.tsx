import { CountUp } from "@/components/CountUp";
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
            <p className="text-foreground text-4xl font-extrabold tabular-nums sm:text-5xl">
              <CountUp value={stat.value} suffix={stat.suffix ?? ""} />
            </p>
            <p className="text-muted-foreground mt-2 text-sm font-medium sm:text-base">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
