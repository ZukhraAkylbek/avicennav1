import { publicClient } from "./specialties.server";

export type DiagnosticsSection = {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  primary_label: string | null;
  primary_url: string | null;
  secondary_label: string | null;
  secondary_url: string | null;
  sort_order: number;
};

export type DiagnosticsCategory = {
  id: string;
  key: string;
  name: string;
  sort_order: number;
};

export type DiagnosticsSymptom = {
  id: string;
  name: string;
  recommendation: string;
  sort_order: number;
};

export type DiagnosticsItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category_key: string | null;
  icon: string | null;
  image_url: string | null;
  price: string | null;
  badge: string | null;
  body: string | null;
  includes: string | null;
  preparation: string | null;
  hero_note: string | null;
  advantages: string | null;
  kinds: string | null;
  offer_title: string | null;
  offer_text: string | null;
  schedule: string | null;
  faq: string | null;
  seo_heading: string | null;
  seo_text: string | null;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number;
  updated_at: string;
};

const SECTION_SELECT =
  "id, key, title, subtitle, body, image_url, primary_label, primary_url, secondary_label, secondary_url, sort_order";
const CATEGORY_SELECT = "id, key, name, sort_order";
const SYMPTOM_SELECT = "id, name, recommendation, sort_order";
const ITEM_SELECT =
  "id, slug, title, subtitle, category_key, icon, image_url, price, badge, body, includes, preparation, meta_title, meta_description, sort_order, updated_at";

export async function listDiagnosticsSections(): Promise<DiagnosticsSection[]> {
  const { data, error } = await publicClient()
    .from("diagnostics_sections")
    .select(SECTION_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listDiagnosticsCategories(): Promise<DiagnosticsCategory[]> {
  const { data, error } = await publicClient()
    .from("diagnostics_categories")
    .select(CATEGORY_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listDiagnosticsSymptoms(): Promise<DiagnosticsSymptom[]> {
  const { data, error } = await publicClient()
    .from("diagnostics_symptoms")
    .select(SYMPTOM_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listDiagnosticsItems(): Promise<DiagnosticsItem[]> {
  const { data, error } = await publicClient()
    .from("diagnostics_items")
    .select(ITEM_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getDiagnosticsItem(slug: string): Promise<DiagnosticsItem | null> {
  const { data, error } = await publicClient()
    .from("diagnostics_items")
    .select(ITEM_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
