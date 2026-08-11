import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const SITE_IMAGES_BUCKET = "site-images";

export type SiteContentRow = {
  key: string;
  value: string | null;
  image_path: string | null;
};

export type SiteContentMap = Record<string, { value: string | null; url: string | null }>;

/** Реестр редактируемых полей: админка строится автоматически из этого списка. */
export type ContentField = {
  key: string;
  label: string;
  group: string;
  kind: "text" | "textarea" | "image";
  fallback?: string;
};

export const CONTENT_FIELDS: ContentField[] = [
  // Хедер
  { key: "header.phone", label: "Телефон в хедере", group: "Хедер", kind: "text", fallback: "+996 779 909 009" },
  { key: "header.cta", label: "Текст кнопки записи", group: "Хедер", kind: "text", fallback: "Записаться" },

  // Hero
  { key: "hero.eyebrow", label: "Надзаголовок", group: "Главный баннер", kind: "text", fallback: "Клиники «Авиценна» · Бишкек" },
  { key: "hero.title", label: "Заголовок", group: "Главный баннер", kind: "textarea", fallback: "Медицинская помощь, которой можно доверять" },
  { key: "hero.subtitle", label: "Подзаголовок", group: "Главный баннер", kind: "textarea", fallback: "Сеть многопрофильных клиник «Авиценна» в Бишкеке: приём специалистов, диагностика, хирургия, травмпункт и стационар — круглосуточно." },
  { key: "hero.stat_value", label: "Цифра на фото", group: "Главный баннер", kind: "text", fallback: "15+ лет" },
  { key: "hero.stat_label", label: "Подпись к цифре", group: "Главный баннер", kind: "text", fallback: "заботимся о здоровье пациентов" },

  // Счётчики
  { key: "stats.1_value", label: "Счётчик 1 — значение", group: "Счётчики", kind: "text", fallback: "9" },
  { key: "stats.1_suffix", label: "Счётчик 1 — приставка", group: "Счётчики", kind: "text", fallback: " направлений" },
  { key: "stats.1_label", label: "Счётчик 1 — подпись", group: "Счётчики", kind: "text", fallback: "от терапии до хирургии" },
  { key: "stats.2_value", label: "Счётчик 2 — значение", group: "Счётчики", kind: "text", fallback: "24" },
  { key: "stats.2_suffix", label: "Счётчик 2 — приставка", group: "Счётчики", kind: "text", fallback: "/7" },
  { key: "stats.2_label", label: "Счётчик 2 — подпись", group: "Счётчики", kind: "text", fallback: "травмпункт и стационар" },
  { key: "stats.3_value", label: "Счётчик 3 — значение", group: "Счётчики", kind: "text", fallback: "2" },
  { key: "stats.3_suffix", label: "Счётчик 3 — приставка", group: "Счётчики", kind: "text", fallback: " филиала" },
  { key: "stats.3_label", label: "Счётчик 3 — подпись", group: "Счётчики", kind: "text", fallback: "в Бишкеке" },
  { key: "stats.4_value", label: "Счётчик 4 — значение", group: "Счётчики", kind: "text", fallback: "50000" },
  { key: "stats.4_suffix", label: "Счётчик 4 — приставка", group: "Счётчики", kind: "text", fallback: "+" },
  { key: "stats.4_label", label: "Счётчик 4 — подпись", group: "Счётчики", kind: "text", fallback: "приёмов в год" },

  // Быстрый доступ
  { key: "quick.eyebrow", label: "Надзаголовок", group: "Быстрый доступ", kind: "text", fallback: "Быстрый доступ" },
  { key: "quick.title", label: "Заголовок", group: "Быстрый доступ", kind: "text", fallback: "Разделы клиники" },

  // Картинки
  { key: "image.about", label: "Фото блока «О клинике»", group: "Изображения", kind: "image" },
  { key: "image.cta", label: "Фото блока записи", group: "Изображения", kind: "image" },
];

const isAbsolute = (value: string) => /^https?:\/\//i.test(value);

export async function fetchSiteContent(): Promise<SiteContentMap> {
  const { data, error } = await supabase
    .from("site_content")
    .select("key, value, image_path");
  if (error) throw error;

  const rows = (data ?? []) as SiteContentRow[];
  const paths = rows
    .map((r) => r.image_path)
    .filter((p): p is string => !!p && !isAbsolute(p));

  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data: urls } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .createSignedUrls(paths, 60 * 60 * 6);
    urls?.forEach((item) => {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    });
  }

  const map: SiteContentMap = {};
  for (const row of rows) {
    map[row.key] = {
      value: row.value ?? null,
      url: row.image_path
        ? isAbsolute(row.image_path)
          ? row.image_path
          : (signed.get(row.image_path) ?? null)
        : null,
    };
  }
  return map;
}

const fallbackOf = (key: string) => CONTENT_FIELDS.find((f) => f.key === key)?.fallback ?? "";

/** Чтение редактируемого контента с фолбэком на значения из кода. */
export function useSiteContent() {
  const { data } = useQuery({
    queryKey: ["site-content"],
    queryFn: fetchSiteContent,
    staleTime: 60_000,
  });

  const t = (key: string, fallback?: string) => {
    const v = data?.[key]?.value;
    return v && v.trim().length > 0 ? v : (fallback ?? fallbackOf(key));
  };

  const img = (key: string, fallback?: string) => data?.[key]?.url ?? fallback ?? null;

  return { t, img, content: data };
}
