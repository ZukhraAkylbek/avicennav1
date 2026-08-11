import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";

import { fetchActiveHeroSlides } from "@/lib/hero-slides";
import { BOOKING_URL } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

export function HeroBanner() {
  const { data: slides } = useQuery({
    queryKey: ["hero-slides", "active"],
    queryFn: fetchActiveHeroSlides,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);
  const count = slides?.length ?? 0;

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

  // Автопрокрутка (останавливается при взаимодействии с указателем)
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
    <section aria-label="Главный баннер" className="relative bg-muted">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {(slides ?? []).map((slide, index) => (
            <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative h-[260px] w-full sm:h-[380px] lg:h-[520px]">
                <img
                  src={slide.displayUrl}
                  alt={slide.title ?? "Слайд баннера"}
                  width={1920}
                  height={1088}
                  {...(index === 0 ? {} : { loading: "lazy" as const })}
                  className="h-full w-full object-cover"
                />
                <div className="from-brand-black/65 via-brand-black/20 absolute inset-0 bg-gradient-to-r to-transparent" />
                {(slide.title || slide.subtitle) && (
                  <div className="absolute inset-0 flex items-center">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
                      <div className="max-w-2xl">
                        {slide.title && (
                          <h1 className="text-brand-white text-3xl leading-tight font-extrabold drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl">
                            {slide.title}
                          </h1>
                        )}
                        {slide.subtitle && (
                          <p className="text-brand-white mt-3 text-lg font-semibold sm:mt-5 sm:text-2xl">
                            {slide.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}
          {count === 0 && (
            <div className="min-w-0 flex-[0_0_100%]">
              <div className="h-[260px] w-full sm:h-[380px] lg:h-[520px]" />
            </div>
          )}
        </div>
      </div>

      {/* CTA поверх слайдера */}
      <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center sm:bottom-16 lg:inset-x-auto lg:right-10 lg:bottom-20 lg:justify-end">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-terracotta text-brand-white pointer-events-auto inline-flex items-center gap-2 rounded-full px-7 py-4 text-base font-semibold tracking-wide uppercase shadow-[0_12px_30px_-10px_rgba(0,0,0,0.55)] transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:outline-none sm:px-9 sm:py-5 sm:text-lg"
        >
          Записаться онлайн
          <ArrowUpRight className="size-5" aria-hidden="true" />
        </a>
      </div>

      {/* Точки-индикаторы */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 sm:bottom-5">
          {(slides ?? []).map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Слайд ${index + 1}`}
              aria-current={index === selected}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "rounded-full transition-all duration-200",
                "size-4 sm:size-3",
                index === selected
                  ? "bg-brand-white w-10 sm:w-8"
                  : "bg-brand-white/50 hover:bg-brand-white/80",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
