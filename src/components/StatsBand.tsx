type Stat = { value: string; label: string };

export function StatsBand({ stats }: { stats: Stat[] }) {
  const tones = ["bg-surface-green", "bg-surface-red", "bg-surface-soft"];

  return (
    <section aria-label="Клиника в цифрах" className="border-border border-y">
      <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`${tones[index % tones.length]} border-border px-6 py-8 text-center sm:border-l sm:first:border-l-0`}
          >
            <p className="text-foreground text-3xl font-extrabold sm:text-4xl">{stat.value}</p>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
