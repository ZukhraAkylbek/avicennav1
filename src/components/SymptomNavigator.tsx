import { useState } from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DiagnosticsSymptom } from "@/lib/diagnostics.server";

export function SymptomNavigator({
  title,
  subtitle,
  note,
  symptoms,
}: {
  title: string;
  subtitle?: string | null;
  note?: string | null;
  symptoms: DiagnosticsSymptom[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = symptoms.find((s) => s.id === activeId) ?? null;

  if (symptoms.length === 0) return null;

  return (
    <section id="navigator" className="border-border border-b">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:py-16">
        <p className="text-accent text-[13px] font-extrabold tracking-[0.18em] uppercase">
          Навигатор
        </p>
        <h2 className="text-foreground mt-3 text-3xl font-extrabold tracking-tight sm:text-[42px]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground mt-3 max-w-2xl text-[17px] leading-relaxed">
            {subtitle}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {symptoms.map((symptom) => {
            const isActive = symptom.id === activeId;
            return (
              <button
                key={symptom.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveId(isActive ? null : symptom.id)}
                className={cn(
                  "rounded-full border px-5 py-3 text-[16px] font-semibold transition-colors sm:text-[17px]",
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {symptom.name}
              </button>
            );
          })}
        </div>

        {active && (
          <div className="border-primary/25 bg-primary/5 mt-8 flex items-start gap-3 rounded-3xl border px-5 py-5 sm:px-7">
            <Info className="text-primary mt-1 size-5 shrink-0" strokeWidth={2} />
            <p className="text-foreground text-[17px] leading-relaxed sm:text-[19px]">
              По симптому <span className="font-extrabold">«{active.name}»</span>{" "}
              {active.recommendation}
            </p>
          </div>
        )}

        {note && <p className="text-muted-foreground mt-6 max-w-3xl text-[14px] leading-relaxed">* {note}</p>}
      </div>
    </section>
  );
}
