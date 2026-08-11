import { createFileRoute } from "@tanstack/react-router";

import { HeroBanner } from "@/components/HeroBanner";
import { QuickLinksAndBranches } from "@/components/QuickLinksAndBranches";
import { ServiceTiles } from "@/components/ServiceTiles";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Авиценна — сеть многопрофильных клиник в Бишкеке" },
      {
        name: "description",
        content:
          "Поликлиника, травмпункт 24/7, хирургия, лаборатория и стационар в Бишкеке. Онлайн-запись к врачу за минуту.",
      },
      {
        property: "og:title",
        content: "Авиценна — сеть многопрофильных клиник в Бишкеке",
      },
      {
        property: "og:description",
        content:
          "Приём специалистов, диагностика, анализы и стационар. Круглосуточная запись: +996 779 909 009.",
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
        <ServiceTiles />
        <QuickLinksAndBranches />
      </main>
      <SiteFooter />
    </div>
  );
}
