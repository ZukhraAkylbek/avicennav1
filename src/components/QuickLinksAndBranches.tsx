import { SectionHeading } from "@/components/SectionHeading";
import { CLINIC } from "@/lib/clinic";

export function QuickLinksAndBranches() {
  return (
    <section id="filialy" className="border-border border-t py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Филиалы"
          title="Найти клинику рядом"
          description="Приём в двух филиалах Бишкека. Травмпункт и стационар работают круглосуточно."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <ul className="space-y-4">
            {CLINIC.branches.map((branch) => (
              <li key={branch.name} className="border-border rounded-lg border p-6">
                <p className="text-foreground text-lg font-bold">{branch.name}</p>
                <p className="text-muted-foreground mt-1 text-base">
                  {branch.city}, {branch.street}
                </p>
                <a
                  href={`tel:${CLINIC.phones[0]}`}
                  className="text-brand-green mt-3 inline-block text-base font-semibold"
                >
                  +996 779 909 009
                </a>
              </li>
            ))}
          </ul>

          <div className="border-border overflow-hidden rounded-lg border">
            <iframe
              title="Филиалы клиники «Авиценна» в Бишкеке"
              src="https://www.openstreetmap.org/export/embed.html?bbox=74.52%2C42.80%2C74.68%2C42.90&amp;layer=mapnik"
              loading="lazy"
              className="h-[300px] w-full border-0 lg:h-full lg:min-h-[380px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
