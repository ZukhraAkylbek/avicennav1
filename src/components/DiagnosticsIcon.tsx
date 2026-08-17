import { icons, Stethoscope } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Иконка исследования: либо загруженное фото/иконка (image_url),
 * либо line-иконка lucide по имени из админки.
 */
export function DiagnosticsIcon({
  icon,
  imageUrl,
  title,
  className,
}: {
  icon?: string | null | undefined;
  imageUrl?: string | null | undefined;
  title: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <span
        className={cn(
          "bg-surface-soft grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl",
          className,
        )}
      >
        <img src={imageUrl} alt={title} loading="lazy" className="size-full object-cover" />
      </span>
    );
  }

  const Icon = (icon && (icons as Record<string, typeof Stethoscope>)[icon]) || Stethoscope;

  return (
    <span
      className={cn(
        "bg-surface-soft text-primary grid size-12 shrink-0 place-items-center rounded-2xl",
        className,
      )}
    >
      <Icon className="size-6" strokeWidth={1.9} />
    </span>
  );
}
