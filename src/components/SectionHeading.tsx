import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="text-foreground mt-3 text-3xl leading-tight font-extrabold sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
