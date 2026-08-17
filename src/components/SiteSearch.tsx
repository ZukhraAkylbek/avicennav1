import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { checkupPageQueryOptions } from "@/lib/checkups.queries";
import { pagesQueryOptions } from "@/lib/pages.queries";
import { specialtiesQueryOptions } from "@/lib/specialties.queries";

type Hit = { title: string; subtitle?: string | undefined; group: string; to: string };

const STATIC_HITS: Hit[] = [
  { title: "Направления", group: "Разделы", to: "/napravleniya" },
  { title: "Чекапы", group: "Разделы", to: "/checkups" },
  { title: "Услуги", group: "Разделы", to: "/#uslugi" },
  { title: "Диагностика", group: "Разделы", to: "/#preimushchestva" },
  { title: "Врачи", group: "Разделы", to: "/#vrachi" },
  { title: "Филиалы и контакты", group: "Разделы", to: "/#filialy" },
  { title: "Вопросы и ответы", group: "Разделы", to: "/#faq" },
];

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").trim();

export function SiteSearch({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const enabled = open;
  const specialties = useQuery({ ...specialtiesQueryOptions(), enabled });
  const checkups = useQuery({ ...checkupPageQueryOptions(), enabled });
  const pages = useQuery({ ...pagesQueryOptions(), enabled });

  const index = useMemo<Hit[]>(() => {
    const hits: Hit[] = [...STATIC_HITS];
    for (const s of specialties.data ?? []) {
      hits.push({
        title: s.name,
        subtitle: s.intro ?? undefined,
        group: "Направления",
        to: `/napravleniya/${s.slug}`,
      });
    }
    for (const c of checkups.data?.cards ?? []) {
      hits.push({
        title: c.title,
        subtitle: c.subtitle ?? undefined,
        group: "Чекапы",
        to: `/checkups/${c.slug}`,
      });
    }
    for (const p of pages.data ?? []) {
      hits.push({ title: p.title, group: "Страницы", to: p.path });
    }
    return hits;
  }, [specialties.data, checkups.data, pages.data]);

  const results = useMemo(() => {
    const query = norm(q);
    if (query.length < 2) return [];
    return index
      .map((hit) => {
        const title = norm(hit.title);
        const sub = norm(hit.subtitle ?? "");
        let score = -1;
        if (title.startsWith(query)) score = 0;
        else if (title.includes(query)) score = 1;
        else if (sub.includes(query)) score = 2;
        return { hit, score };
      })
      .filter((r) => r.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 8)
      .map((r) => r.hit);
  }, [index, q]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const go = (to: string) => {
    setOpen(false);
    setQ("");
    if (to.startsWith("/#")) {
      window.location.href = to;
      return;
    }
    void navigate({ to, replace: false });
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div className="border-border focus-within:border-brand-green flex items-center gap-2 rounded-xl border bg-background px-3 py-2 transition-colors">
        <Search className="text-muted-foreground size-4 shrink-0" aria-hidden />
        <input
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) go(results[0].to);
            if (e.key === "Escape") setOpen(false);
          }}
          type="search"
          placeholder="Поиск по сайту"
          aria-label="Поиск по сайту"
          className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-[15px] outline-none"
        />
        {q && (
          <button
            type="button"
            aria-label="Очистить поиск"
            onClick={() => setQ("")}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {open && norm(q).length >= 2 && (
        <div className="border-border bg-background absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border p-2 shadow-xl">
          {results.length === 0 ? (
            <p className="text-muted-foreground px-3 py-4 text-sm">Ничего не найдено</p>
          ) : (
            <ul>
              {results.map((hit) => (
                <li key={`${hit.group}-${hit.to}-${hit.title}`}>
                  <button
                    type="button"
                    onClick={() => go(hit.to)}
                    className="hover:bg-muted flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors"
                  >
                    <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-wide">
                      {hit.group}
                    </span>
                    <span className="text-foreground text-[15px] font-semibold">{hit.title}</span>
                    {hit.subtitle && (
                      <span className="text-muted-foreground line-clamp-1 text-xs">
                        {hit.subtitle}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
