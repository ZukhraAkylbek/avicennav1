import { CLINIC, doubleGisSearchUrl, googleMapsUrl } from "@/lib/clinic";

/** Список филиалов с быстрыми ссылками на Google Maps, 2ГИС и звонок. */
export function BranchesMap() {
  const phone = CLINIC.phones[0] ?? "";

  return (
    <section id="filialy" className="border-border border-t py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8">
          <span className="eyebrow">Наши филиалы</span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            6 филиалов в Бишкеке
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl text-base sm:text-lg">
            Выберите ближайший адрес и постройте маршрут в Google Maps или 2ГИС.
          </p>
        </div>

        <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CLINIC.branches.map((branch) => (
            <div
              key={branch.name}
              className="border-border bg-card hover:border-brand-green/40 hover:bg-surface-green/50 flex h-full flex-col rounded-xl border p-4 transition-colors"
            >
              <p className="text-foreground font-bold leading-tight">📍 {branch.name}</p>
              <p className="text-muted-foreground mt-1 text-sm">{branch.city}, Кыргызстан</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={googleMapsUrl(branch.latitude, branch.longitude, branch.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground ring-border hover:bg-surface-green inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-inset transition-colors"
                >
                  Google Maps
                </a>
                <a
                  href={doubleGisSearchUrl(branch.street)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground ring-border hover:bg-surface-green inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-inset transition-colors"
                >
                  2ГИС
                </a>
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="text-foreground ring-border hover:bg-surface-green inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-inset transition-colors"
                  >
                    Позвонить
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
