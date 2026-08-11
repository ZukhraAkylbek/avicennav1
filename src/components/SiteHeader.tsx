import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { BOOKING_URL } from "@/lib/site-config";
import { CLINIC } from "@/lib/clinic";
import { useSiteContent } from "@/lib/site-content";

const NAV = [
  { label: "Направления", to: "/napravleniya" as const },
];

const NAV_ANCHORS = [
  { label: "Поликлиника", href: "/#napravleniya" },
  { label: "Услуги", href: "/#uslugi" },
  { label: "Чекапы", href: "/#process" },
  { label: "Диагностика", href: "/#preimushchestva" },
  { label: "О нас", href: "/#faq" },
];



export function SiteHeader({ breadcrumb }: { breadcrumb?: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useSiteContent();
  const phoneHuman = t("header.phone");
  const ctaLabel = t("header.cta");

  return (
    <header className="bg-background/95 border-border sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6 lg:flex lg:gap-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="bg-brand-green text-brand-white grid size-8 place-items-center rounded-full text-sm font-extrabold">
              A
            </span>
            <span className="text-foreground text-lg font-extrabold tracking-tight">
              Авиценна
            </span>
          </Link>
          {breadcrumb && (
            <span className="text-muted-foreground hidden truncate text-sm sm:block">
              / {breadcrumb}
            </span>
          )}
        </div>

        <nav
          aria-label="Главное меню"
          className="hidden items-center gap-7 lg:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-foreground hover:text-brand-green text-[15px] font-semibold transition-colors"
              activeProps={{ className: "text-brand-green" }}
            >
              {item.label}
            </Link>
          ))}
          {NAV_ANCHORS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground text-[15px] font-medium transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:gap-5">
          <a
            href={`tel:${CLINIC.phones[0]}`}
            className="text-foreground hidden text-[15px] font-semibold sm:block"
          >
            {phoneHuman}
          </a>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-accent text-accent-foreground hidden rounded-xl px-5 py-2.5 text-[15px] font-bold transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 sm:inline-flex"
          >
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((v) => !v)}
            className="border-border text-foreground grid size-10 shrink-0 place-items-center rounded-md border lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-border bg-background border-t lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-border text-foreground border-b py-3.5 text-lg font-semibold"
              >
                {item.label}
              </Link>
            ))}
            {NAV_ANCHORS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-border text-foreground border-b py-3.5 text-lg font-medium last:border-0"
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-wrap items-center gap-3 py-4">
              <a
                href={`tel:${CLINIC.phones[0]}`}
                className="border-border text-foreground rounded-md border px-5 py-3 text-base font-semibold"
              >
                {phoneHuman}
              </a>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-accent text-accent-foreground rounded-xl px-5 py-3 text-base font-bold"
              >
                {ctaLabel}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
