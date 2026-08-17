import { publicClient } from "./specialties.server";

export type PageListItem = {
  id: string;
  parent_id: string | null;
  slug: string;
  path: string;
  title: string;
  sort_order: number;
  updated_at: string;
};

export type PageDetail = PageListItem & {
  h1_title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  body: string | null;
  blocks: unknown;
  children: { path: string; title: string }[];
};

export type SiteSettings = {
  heading_font: string;
  body_font: string;
  font_scale: number;
};

export async function listPublishedPages(): Promise<PageListItem[]> {
  const { data, error } = await publicClient()
    .from("pages")
    .select("id, parent_id, slug, path, title, sort_order, updated_at")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getPageByPath(path: string): Promise<PageDetail | null> {
  const supabase = publicClient();

  const { data: page, error } = await supabase
    .from("pages")
    .select(
      "id, parent_id, slug, path, title, h1_title, meta_title, meta_description, body, blocks, sort_order, updated_at",
    )
    .eq("path", path)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  if (!page) return null;

  const { data: children } = await supabase
    .from("pages")
    .select("path, title")
    .eq("parent_id", page.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return { ...page, children: children ?? [] };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data } = await publicClient()
    .from("site_settings")
    .select("heading_font, body_font, font_scale")
    .limit(1)
    .maybeSingle();

  return {
    heading_font: data?.heading_font ?? "Montserrat",
    body_font: data?.body_font ?? "Manrope",
    font_scale: Number(data?.font_scale ?? 1),
  };
}
