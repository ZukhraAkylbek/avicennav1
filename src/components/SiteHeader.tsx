import { Link } from "@tanstack/react-router";
import { Phone, Search, Stethoscope } from "lucide-react";

import { BOOKING_URL, SITE_NAME } from "@/lib/site-config";

const NAV = [
  { label: "Врачи", href: "#doctors" },
  { label: "Услуги", href: "#services" },
  { label: "Диагностика", href: "#diagnostics" },
  { label: "Анализы", href: "#labs" },
  { label: "Акции", href: "#promo" },
  { label: "Пациентам", href: "#patients" },
  { label: "О клинике", href: "#about" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Контакты", href: "#contacts" },
];

export function SiteHeader() {
  return (
    <header className="bg-background border-border sticky top-0 z-50 border-b shadow-sm">
      {/* Верхняя полоса: логотип, телефон, CTA */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-brand-green text-brand-white flex size-9 items-center justify-center rounded-xl">
            <Stethoscope className="size-5" aria-hidden="true" />
          </span>
          <span className="text-brand-green-dark text-2xl font-extrabold tracking-tight">
            {SITE_NAME}
          </span>
        </Link>

        <a href="tel:+996779909009" className="flex items-center gap-2">
          <Phone className="text-brand-green size-5" aria-hidden="true" />
          <span className="flex flex-col leading-tight">
            <span className="text-muted-foreground hidden text-xs sm:block">
              Круглосуточная запись:
            </span>
            <span className="text-brand-green-dark text-lg font-bold sm:text-xl">
              +996 779 909 009
            </span>
          </span>
        </a>

        <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
          <a
            href="#home-visit"
            className="bg-brand-green-light text-brand-white rounded-full px-5 py-3 text-sm font-bold whitespace-nowrap transition-transform hover:-translate-y-0.5 sm:text-base"
          >
            Вызвать врача на дом
          </a>
          <a
            href="#online"
            className="bg-brand-green-dark text-brand-white rounded-full px-5 py-3 text-sm font-bold whitespace-nowrap transition-transform hover:-translate-y-0.5 sm:text-base"
          >
            Онлайн-консультация
          </a>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-terracotta text-brand-white rounded-full px-5 py-3 text-sm font-bold whitespace-nowrap transition-transform hover:-translate-y-0.5 sm:text-base"
          >
            Записаться онлайн
          </a>
          <span className="bg-brand-green-dark text-brand-white rounded-full px-4 py-3 text-sm font-bold">
            Kg/En
          </span>
        </div>
      </div>

      {/* Нижняя полоса: поиск + меню */}
      <div className="border-border border-t">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2 sm:px-6">
          <label className="bg-muted flex w-64 shrink-0 items-center gap-2 rounded-full px-4 py-2">
            <Search className="text-muted-foreground size-4" aria-hidden="true" />
            <span className="sr-only">Поиск по сайту</span>
            <input
              type="search"
              placeholder="Поиск по сайту"
              className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-base outline-none"
            />
          </label>
          <nav
            aria-label="Главное меню"
            className="flex items-center gap-5 overflow-x-auto py-1"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-brand-green text-base font-semibold whitespace-nowrap transition-colors sm:text-lg"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
