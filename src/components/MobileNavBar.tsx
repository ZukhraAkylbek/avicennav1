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
      className="border-border bg-background fixed inset-x-0 bottom-0 z-50 border-t lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 items-end">
        {items.map(({ label, href, Icon, center }) => {
          const external = isExternal(href);
          return (
            <li key={label} className="min-w-0">
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={
                  center
                    ? "-mt-6 flex flex-col items-center gap-1.5 px-1 pb-2"
                    : "text-foreground flex flex-col items-center gap-1.5 px-1 pb-2 pt-2.5"
                }
              >
                {center ? (
                  <span className="bg-brand-green ring-background grid size-14 place-items-center rounded-full text-white shadow-lg ring-4">
                    <Icon className="size-6" strokeWidth={2} />
                  </span>
                ) : (
                  <Icon className="size-6 shrink-0" strokeWidth={1.7} />
                )}
                <span className="w-full truncate text-center text-[12.5px] font-bold">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
