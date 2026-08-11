import { useQuery } from "@tanstack/react-query";

import { siteSettingsQueryOptions } from "@/lib/pages.queries";

/** Применяет выбранные в админке шрифты и масштаб текста ко всему сайту. */
export function SiteTypography() {
  const { data } = useQuery(siteSettingsQueryOptions());
  if (!data) return null;

  const families = Array.from(new Set([data.heading_font, data.body_font]));
  const href = `https://fonts.googleapis.com/css2?${families
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800;900`)
    .join("&")}&display=swap`;

  const css = `:root{--font-display:"${data.heading_font}",ui-sans-serif,system-ui,sans-serif;--font-sans:"${data.body_font}",ui-sans-serif,system-ui,sans-serif}html{font-size:${(data.font_scale * 100).toFixed(2)}%}`;

  return (
    <>
      <link rel="stylesheet" href={href} />
      <style>{css}</style>
    </>
  );
}
