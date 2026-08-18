import { useEffect, useRef, useState } from "react";

/** Возвращает ref и флаг «элемент появился во вьюпорте» (однократно). */
export function useInView<T extends HTMLElement = HTMLDivElement>(_threshold = 0.2) {
  // Запускаем анимацию раньше: небольшой порог + запас снизу вьюпорта.
  const threshold = 0;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px 15% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return { ref, inView };
}
