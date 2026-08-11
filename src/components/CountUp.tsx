import { useEffect, useState } from "react";

import { useInView } from "@/hooks/use-in-view";

type CountUpProps = {
  /** Числовое значение цели (может прийти строкой из админки). */
  value: string | number;
  suffix?: string;
  duration?: number;
  className?: string;
};

const formatter = new Intl.NumberFormat("ru-RU");

/** Анимированный счётчик: считает от 0 до значения, когда попадает во вьюпорт. */
export function CountUp({ value, suffix = "", duration = 1600, className }: CountUpProps) {
  const target = Number(String(value).replace(/[^\d.]/g, "")) || 0;
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {formatter.format(current)}
      {suffix}
    </span>
  );
}
