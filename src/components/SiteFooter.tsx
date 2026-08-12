import logo from "@/assets/logo-avicenna.png.asset.json";
import { CLINIC } from "@/lib/clinic";
import { BOOKING_URL } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer id="contacts" className="border-border border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <img
            src={logo.url}
            alt="Клинико-диагностический центр «Авиценна»"
            width={840}
            height={393}
            loading="lazy"
            className="h-11 w-auto"
          />

          <p className="text-muted-foreground mt-4 max-w-sm text-base">
            Сеть многопрофильных клиник в Бишкеке. Травмпункт и стационар — круглосуточно.
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-accent-foreground mt-6 inline-flex rounded-md px-6 py-3.5 text-base font-semibold transition-opacity hover:opacity-90"
          >
            Записаться онлайн
          </a>
        </div>

        <div>
          <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Контакты
          </p>
          <ul className="mt-4 space-y-2 text-base">
            <li>
              <a href={`tel:${CLINIC.phones[0]}`} className="text-foreground font-semibold">
                +996 779 909 009
              </a>
            </li>
            <li className="text-muted-foreground">{CLINIC.email}</li>
            <li className="text-muted-foreground">Пн–Пт: 8:00–20:00 · Сб–Вс: 9:00–18:00</li>
          </ul>
        </div>

        <div>
          <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Филиалы
          </p>
          <ul className="mt-4 space-y-2 text-base">
            {CLINIC.branches.map((branch) => (
              <li key={branch.name} className="text-muted-foreground">
                {branch.city}, {branch.street}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-border border-t">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm sm:px-6">
          <span>© {new Date().getFullYear()} Медицинская клиника «Авиценна», Бишкек</span>
          <a href="#faq" className="hover:text-foreground">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  );
}
