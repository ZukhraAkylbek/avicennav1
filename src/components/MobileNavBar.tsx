import { Hospital, MapPin, SquarePen, Stethoscope, Users } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

import { useSiteContent } from "@/lib/site-content";

const ICONS = [Hospital, Users, SquarePen, Stethoscope, MapPin];

export const MOBILE_NAV_SLOTS = [
  { label: "О нас", href: "/#faq" },
  { label: "Врачи", href: "/#vrachi" },
  { label: "Записаться", href: "https://alteg.io/" },
  { label: "Услуги", href: "/#uslugi" },
  { label: "Контакты", href: "/#filialy" },
];

const isExternal = (href: string) => /^(https?:|tel:|mailto:)/i.test(href);

/** Нижняя навигация для мобильных: 5 пунктов, центральная кнопка записи. */
export function MobileNavBar() {
  const { t } = useSiteContent();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return null;

  const items = MOBILE_NAV_SLOTS.map((slot, i) => ({
    label: t(`mobilenav.${i + 1}.label`, slot.label),
    href: t(`mobilenav.${i + 1}.href`, slot.href),
    Icon: ICONS[i] ?? Hospital,
    center: i === 2,
  }));

  return (
    <nav
      aria-label="Мобильное меню"
      className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-50 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 6px)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 items-end px-1">
        {items.map(({ label, href, Icon, center }) => {
          const external = isExternal(href);
          return (
            <li key={label} className="min-w-0">
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={
                  center
                    ? "-mt-5 flex min-h-11 flex-col items-center gap-1 px-0.5 pb-1"
                    : "text-foreground flex min-h-11 flex-col items-center gap-1 px-0.5 pb-1 pt-2"
                }
              >
                {center ? (
                  <span className="bg-brand-green ring-background grid size-12 shrink-0 place-items-center rounded-full text-white shadow-lg ring-4">
                    <Icon className="size-[22px]" strokeWidth={2} />
                  </span>
                ) : (
                  <Icon className="size-[22px] shrink-0" strokeWidth={1.8} />
                )}
                <span className="w-full truncate text-center text-[11px] font-bold leading-tight">
                  {label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
