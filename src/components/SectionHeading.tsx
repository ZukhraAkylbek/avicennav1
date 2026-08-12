import type { ReactNode } from "react";

import { Editable } from "@/components/live-edit/LiveEdit";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  ekey,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  /** Префикс ключей для редактирования, например "why" → why.eyebrow / why.title */
  ekey?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="min-w-0">
        {ekey ? (
          <Editable ekey={`${ekey}.eyebrow`} label="Надзаголовок секции" fallback={eyebrow} as="p" className="eyebrow" />
        ) : (
          <p className="eyebrow">{eyebrow}</p>
        )}

        {ekey && typeof title === "string" ? (
          <Editable
            ekey={`${ekey}.title`}
            label="Заголовок секции"
            fallback={title}
            multiline
            as="h2"
            className="text-foreground mt-3 text-3xl leading-tight font-extrabold sm:text-4xl lg:text-[2.75rem]"
          />
        ) : (
          <h2 className="text-foreground mt-3 text-3xl leading-tight font-extrabold sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>
        )}

        {description &&
          (ekey ? (
            <Editable
              ekey={`${ekey}.description`}
              label="Описание секции"
              fallback={description}
              multiline
              as="p"
              className="text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg"
            />
          ) : (
            <p className="text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg">
              {description}
            </p>
          ))}
      </div>
      {action}
    </div>
  );
}
