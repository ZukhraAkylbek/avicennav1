import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Stethoscope,
  UserRound,
  HeartPulse,
  Microscope,
  MapPin,
  Images,
  Search,
  Settings,
  Menu,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/pages", label: "Страницы", icon: FileText },
  { to: "/admin/napravleniya", label: "Направления", icon: Stethoscope },
  { to: "/admin/doctors", label: "Врачи", icon: UserRound },
  { to: "/admin/services", label: "Услуги", icon: HeartPulse },
  { to: "/admin/diagnostics", label: "Диагностика", icon: Microscope },
  { to: "/admin/branches", label: "Филиалы", icon: MapPin },
  { to: "/admin/media", label: "Медиа", icon: Images },
  { to: "/admin/seo", label: "SEO", icon: Search },
  { to: "/admin/settings", label: "Настройки", icon: Settings },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const active = useMemo(
    () =>
      NAV.filter((item) => (item.exact ? pathname === item.to : pathname.startsWith(item.to))).slice(
        -1,
      )[0],
    [pathname],
  );

  return (
    <div className="bg-admin-bg text-admin-ink min-h-screen">
      <div className="mx-auto flex max-w-[1600px]">
        {/* Sidebar */}
        <aside
          className={cn(
            "border-admin-line bg-card fixed inset-y-0 left-0 z-40 w-[264px] shrink-0 border-r px-4 py-6 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-2">
            <Link to="/admin" className="flex items-center gap-2.5">
              <span className="from-admin-blue to-admin-teal grid size-9 place-items-center rounded-xl bg-gradient-to-br">
                <Sparkles className="size-4 text-white" />
              </span>
              <span className="leading-tight">
                <span className="block text-[15px] font-bold">Avicenna</span>
                <span className="text-admin-muted block text-[11px] font-medium">
                  Content platform
                </span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-admin-muted hover:bg-admin-bg rounded-lg p-2 lg:hidden"
              aria-label="Закрыть меню"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="mt-7 space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-admin-blue-soft text-admin-blue"
                      : "text-admin-muted hover:bg-admin-bg hover:text-admin-ink",
                  )}
                >
                  <Icon className="size-[18px] shrink-0" strokeWidth={1.9} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-admin-line bg-admin-teal-soft mt-8 rounded-2xl border p-4">
            <p className="text-[13px] font-bold">Живое редактирование</p>
            <p className="text-admin-muted mt-1 text-[12px] leading-snug">
              Откройте сайт и включите режим редактирования, чтобы менять тексты прямо на странице.
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-admin-blue mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold"
            >
              Открыть сайт <ExternalLink className="size-3.5" />
            </a>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          />
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <header className="border-admin-line bg-admin-bg/80 sticky top-0 z-20 border-b px-4 py-3 backdrop-blur sm:px-8">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="border-admin-line bg-card rounded-xl border p-2 lg:hidden"
                aria-label="Открыть меню"
              >
                <Menu className="size-4" />
              </button>
              <p className="text-admin-muted min-w-0 truncate text-[13px] font-semibold">
                Админка / {active?.label ?? "Dashboard"}
              </p>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-admin-line bg-card hover:border-admin-blue/40 inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-semibold"
              >
                Сайт <ExternalLink className="size-3.5" />
              </a>
            </div>
          </header>

          <main className="px-4 pb-16 pt-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
