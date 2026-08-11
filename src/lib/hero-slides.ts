import { supabase } from "@/integrations/supabase/client";

export const HERO_BUCKET = "hero-slides";

export type HeroSlide = {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  sort_order: number;
  is_active: boolean;
};

export type HeroSlideWithUrl = HeroSlide & { displayUrl: string };

const isAbsolute = (value: string) => /^https?:\/\//i.test(value);

/** Приватный бакет: для показа картинок формируем подписанные ссылки. */
export async function withDisplayUrls(slides: HeroSlide[]): Promise<HeroSlideWithUrl[]> {
  const paths = slides.map((s) => s.image_url).filter((url) => !isAbsolute(url));

  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data } = await supabase.storage
      .from(HERO_BUCKET)
      .createSignedUrls(paths, 60 * 60 * 6);
    data?.forEach((item) => {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    });
  }

  return slides.map((slide) => ({
    ...slide,
    displayUrl: isAbsolute(slide.image_url)
      ? slide.image_url
      : (signed.get(slide.image_url) ?? ""),
  }));
}

export async function fetchActiveHeroSlides(): Promise<HeroSlideWithUrl[]> {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, image_url, title, subtitle, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return withDisplayUrls(data ?? []);
}

export async function fetchAllHeroSlides(): Promise<HeroSlideWithUrl[]> {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, image_url, title, subtitle, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return withDisplayUrls(data ?? []);
}
