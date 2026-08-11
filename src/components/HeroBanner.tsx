import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery } from "@tanstack/react-query";

import photoSurgery from "@/assets/image.webp.asset.json";
import photoNurse from "@/assets/image.png.asset.json";
import photoXray from "@/assets/image-2.png.asset.json";
import { fetchActiveHeroSlides, type HeroSlideWithUrl } from "@/lib/hero-slides";
import { BOOKING_URL } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

/** Фолбэк-слайды из фотографий клиники, если в админке ещё нет слайдов. */
const FALLBACK_SLIDES: HeroSlideWithUrl[] = [
  { id: "f1", image_url: photoSurgery.url, title: "Хирургия", subtitle: null },
  { id: "f2", image_url: photoNurse.url, title: "Наши специалисты", subtitle: null },
  { id: "f3", image_url: photoXray.url, title: "Диагностика", subtitle: null },
].map((s) => ({
  ...s,
  sort_order: 0,
  is_active: true,
  displayUrl: s.image_url,
}));


type HeroBannerProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  statValue?: string;
  statLabel?: string;
};

export function HeroBanner({
  eyebrow = "Клиника «Авиценна», Бишкек",
  title,
  subtitle,
  secondaryLabel = "Выбрать направление",
  secondaryHref = "/napravleniya",
  statValue = "15+",
  statLabel = "лет медицинской практики",
}: HeroBannerProps) {
  const { data } = useQuery({
    queryKey: ["hero-slides", "active"],
    queryFn: fetchActiveHeroSlides,
  });
  const slides = data && data.length > 0 ? data : FALLBACK_SLIDES;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);
  const count = slides.length;


  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || count < 2) return;
    let paused = false;
    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };
    emblaApi.on("pointerDown", pause);
    emblaApi.on("pointerUp", resume);
    const timer = window.setInterval(() => {
      if (!paused) emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => {
      window.clearInterval(timer);
      emblaApi.off("pointerDown", pause);
      emblaApi.off("pointerUp", resume);
    };
  }, [emblaApi, count]);

  return (
    <section aria-label="Главный баннер" className="bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <div className="max-w-xl">
          <span className="border-border text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] uppercase">
            <span className="bg-brand-green size-1.5 rounded-full" aria-hidden="true" />
            {eyebrow}
          </span>
          <h1 className="text-foreground mt-6 text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-5 text-lg leading-relaxed sm:text-xl">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent text-accent-foreground rounded-md px-7 py-4 text-base font-semibold transition-opacity hover:opacity-90 sm:text-lg"
            >
              Записаться на приём
            </a>
            <a
              href={secondaryHref}
              className="border-border text-foreground hover:border-foreground rounded-md border px-7 py-4 text-base font-semibold transition-colors sm:text-lg"
            >
              {secondaryLabel}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-lg" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {(slides ?? []).map((slide, index) => (
                <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
                  <img
                    src={slide.displayUrl}
                    alt={slide.title ?? "Клиника «Авиценна»"}
                    width={1200}
                    height={900}
                    {...(index === 0 ? {} : { loading: "lazy" as const })}
                    className="h-[280px] w-full object-cover sm:h-[420px] lg:h-[520px]"
                  />
                </div>
              ))}
              {count === 0 && (
                <div className="bg-surface-soft h-[280px] min-w-0 flex-[0_0_100%] sm:h-[420px] lg:h-[520px]" />
              )}
            </div>
          </div>

          <div className="bg-background border-border absolute bottom-4 left-4 max-w-[70%] rounded-lg border p-4 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.4)] sm:bottom-6 sm:left-6 sm:p-5">
            <p className="text-foreground text-2xl font-extrabold sm:text-3xl">{statValue}</p>
            <p className="text-muted-foreground mt-0.5 text-sm">{statLabel}</p>
          </div>

          {count > 1 && (
            <div className="absolute right-4 bottom-4 flex gap-2 sm:right-6 sm:bottom-6">
              {(slides ?? []).map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Слайд ${index + 1}`}
                  aria-current={index === selected}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    "size-3.5 sm:size-2.5",
                    index === selected
                      ? "bg-brand-white w-8 sm:w-6"
                      : "bg-brand-white/60 hover:bg-brand-white",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
