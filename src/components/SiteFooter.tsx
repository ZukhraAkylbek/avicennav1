import { Clock, MapPin, Phone } from "lucide-react";

import { BOOKING_URL, SITE_NAME } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="bg-brand-green-dark text-brand-white mt-6">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3">
        <div>
          <p className="text-3xl font-extrabold">{SITE_NAME}</p>
          <p className="mt-3 text-lg opacity-90">
            Сеть многопрофильных клиник в Бишкеке. Работаем круглосуточно.
          </p>
        </div>
        <ul className="space-y-3 text-lg">
          <li className="flex items-center gap-3">
            <Phone className="size-5" aria-hidden="true" />
            <a href="tel:+996779909009" className="font-bold">
              +996 779 909 009
            </a>
          </li>
          <li className="flex items-center gap-3">
            <MapPin className="size-5" aria-hidden="true" />
            г. Бишкек, ул. Медицинская 1
          </li>
          <li className="flex items-center gap-3">
            <Clock className="size-5" aria-hidden="true" />
            Травмпункт и стационар — 24/7
          </li>
        </ul>
        <div className="lg:text-right">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-terracotta text-brand-white inline-flex rounded-full px-8 py-4 text-lg font-bold"
          >
            Записаться онлайн
          </a>
        </div>
      </div>
    </footer>
  );
}
