import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/** Серверный публичный клиент (только чтение открытых данных, RLS как anon). */
export function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export type SpecialtyListItem = {
  slug: string;
  name: string;
  h1_title: string;
  intro: string | null;
  tile_color: string;
  updated_at: string;
};

export type SpecialtyDetail = {
  slug: string;
  name: string;
  h1_title: string;
  meta_title: string | null;
  meta_description: string | null;
  intro: string | null;
  body: string | null;
  updated_at: string;
  faqs: { question: string; answer: string }[];
  doctors: {
    slug: string;
    full_name: string;
    job_title: string | null;
    photo_url: string | null;
    bio: string | null;
    experience_years: number | null;
    education: string | null;
  }[];
};

export async function listActiveSpecialties(): Promise<SpecialtyListItem[]> {
  const { data, error } = await publicClient()
    .from("specialties")
    .select("slug, name, h1_title, intro, tile_color, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSpecialtyBySlug(slug: string): Promise<SpecialtyDetail | null> {
  const supabase = publicClient();

  const { data: specialty, error } = await supabase
    .from("specialties")
    .select("id, slug, name, h1_title, meta_title, meta_description, intro, body, updated_at")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!specialty) return null;

  const [{ data: faqs }, { data: doctors }] = await Promise.all([
    supabase
      .from("specialty_faqs")
      .select("question, answer")
      .eq("specialty_id", specialty.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("doctors")
      .select("slug, full_name, job_title, photo_url, bio, experience_years, education")
      .eq("specialty_id", specialty.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const { id: _id, ...rest } = specialty;
  return { ...rest, faqs: faqs ?? [], doctors: doctors ?? [] };
}
