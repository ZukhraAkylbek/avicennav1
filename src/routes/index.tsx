import { createFileRoute } from "@tanstack/react-router";

import { HeroBanner } from "@/components/HeroBanner";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Avicenna — медицинский центр в Бишкеке" },
      {
        name: "description",
        content:
          "Медицинский центр Avicenna в Бишкеке: приём специалистов, диагностика и своя лаборатория. Записаться онлайн можно за минуту.",
      },
      { property: "og:title", content: "Avicenna — медицинский центр в Бишкеке" },
      {
        property: "og:description",
        content:
          "Приём специалистов, диагностика и лаборатория. Онлайн-запись в медицинский центр Avicenna.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main>
        <HeroBanner />
      </main>
    </div>
  );
}
