import { publicClient } from "./specialties.server";

export type CheckupSection = {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  sort_order: number;
};

export type CheckupCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  image_url: string | null;
  price: string | null;
  body: string | null;
  sort_order: number;
  updated_at: string;
};

const SECTION_SELECT = "id, key, title, subtitle, body, sort_order";
const CARD_SELECT =
  "id, slug, title, subtitle, badge, image_url, price, body, sort_order, updated_at";

export async function listCheckupSections(): Promise<CheckupSection[]> {
  const { data, error } = await publicClient()
    .from("checkup_sections")
    .select(SECTION_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listCheckupCards(): Promise<CheckupCard[]> {
  const { data, error } = await publicClient()
    .from("checkup_cards")
    .select(CARD_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCheckupCard(slug: string): Promise<CheckupCard | null> {
  const { data, error } = await publicClient()
    .from("checkup_cards")
    .select(CARD_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}
