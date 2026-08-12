import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Stethoscope,
  UserRound,
  Images,
  ArrowUpRight,
  Type,
  Layers,
} from "lucide-react";

import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — админка Avicenna" },
      { name: "description", content: "Обзор контента сайта клиники «Авиценна»: страницы, направления, врачи, медиа." },
      { property: "og:title", content: "Dashboard — админка Avicenna" },
      { property: "og:description", content: "Обзор и быстрый доступ ко всем разделам контента." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});

const SHORTCUTS = [
  { to: "/admin/pages", label: "Создать страницу", hint: "Раздел, подстраница, категория", icon: Layers },
  { to: "/admin/napravleniya", label: "Направления", hint: "Тексты, SEO, порядок", icon: Stethoscope },
  { to: "/admin/doctors", label: "Врачи", hint: "Карточки специалистов", icon: UserRound },
  { to: "/admin/media", label: "Медиа-библиотека", hint: "Загрузка изображений", icon: Images },
  { to: "/admin/content", label: "Тексты сайта", hint: "Заголовки и подписи блоков", icon: Type },
  { to: "/admin/hero", label: "Слайдер на главной", hint: "Фото и подписи", icon: FileText },
];

function useCount(table: "pages" | "specialties" | "doctors" | "hero_slides") {
  return useQuery({
    queryKey: ["admin-count", table],
    queryFn: async () => {
      const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function AdminDashboard() {
  const pages = useCount("pages");
  const specialties = useCount("specialties");
  const doctors = useCount("doctors");
  const slides = useCount("hero_slides");

  const stats = [
    { label: "Страницы", value: pages.data, icon: FileText },
    { label: "Направления", value: specialties.data, icon: Stethoscope },
    { label: "Врачи", value: doctors.data, icon: UserRound },
    { label: "Слайды", value: slides.data, icon: Images },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Обзор"
        title="Контент-платформа Avicenna"
        description="Управляйте структурой сайта, направлениями, врачами и медиа. Все изменения публикуются сразу."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="border-admin-line bg-card rounded-2xl border p-5 transition-shadow hover:shadow-[0_12px_40px_-24px_rgb(15_23_42_/_0.35)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-admin-muted text-[13px] font-semibold">{stat.label}</p>
                <span className="bg-admin-blue-soft text-admin-blue grid size-9 place-items-center rounded-xl">
                  <Icon className="size-4" strokeWidth={1.9} />
                </span>
              </div>
              <p className="mt-4 text-[30px] leading-none font-extrabold">
                {stat.value ?? "—"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Быстрые действия" description="Самые частые операции с контентом">
          <div className="grid gap-3 sm:grid-cols-2">
            {SHORTCUTS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="border-admin-line hover:border-admin-blue/40 hover:bg-admin-blue-soft/50 group flex items-start gap-3 rounded-xl border p-4 transition-colors"
                >
                  <span className="bg-admin-teal-soft text-admin-teal grid size-9 shrink-0 place-items-center rounded-xl">
                    <Icon className="size-4" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-[14px] font-bold">
                      {item.label}
                      <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    <span className="text-admin-muted mt-0.5 block text-[12.5px]">{item.hint}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel title="Как работает сайт" description="Коротко о структуре">
          <ul className="text-admin-muted space-y-3 text-[13.5px] leading-relaxed">
            <li>
              <span className="text-admin-ink font-bold">Страницы</span> — любые разделы и подстраницы.
              Указывайте родителя, и адрес построится автоматически.
            </li>
            <li>
              <span className="text-admin-ink font-bold">Направления</span> — медицинские разделы с SEO,
              FAQ и врачами.
            </li>
            <li>
              <span className="text-admin-ink font-bold">Медиа</span> — общая библиотека изображений для
              всех блоков.
            </li>
            <li>
              <span className="text-admin-ink font-bold">SEO</span> — заголовки и описания страниц,
              sitemap обновляется сам.
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
