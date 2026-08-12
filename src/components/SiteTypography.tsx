import { useQuery } from "@tanstack/react-query";

import { siteSettingsQueryOptions } from "@/lib/pages.queries";

/** Применяет выбранный в админке масштаб текста ко всему сайту. */
export function SiteTypography() {
  const { data } = useQuery(siteSettingsQueryOptions());
  if (!data) return null;

  const css = `html{font-size:${(data.font_scale * 100).toFixed(2)}%}`;

  return <style>{css}</style>;
}

