import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import { SITE_NAME } from "@/lib/site-config";

const NAV = [
  { label: "О клинике", href: "#about" },
  { label: "Услуги", href: "#services" },
  { label: "Врачи", href: "#doctors" },
  { label: "Акции", href: "#promo" },
  { label: "Контакты", href: "#contacts" },
];

export function SiteHeader() {
  return (
    <header className="bg-background border-border sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="text-brand-green text-xl font-bold tracking-tight">
          {SITE_NAME}
        </Link>
        <nav aria-label="Главное меню" className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-foreground hover:text-brand-green text-sm font-medium transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="tel:+996312000000"
          className="text-brand-green inline-flex items-center gap-2 text-sm font-semibold"
        >
          <Phone className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">+996 (312) 000 000</span>
        </a>
      </div>
    </header>
  );
}
