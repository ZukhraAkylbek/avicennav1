import { createFileRoute } from "@tanstack/react-router";

import { HeroBanner } from "@/components/HeroBanner";
import { QuickLinksAndBranches } from "@/components/QuickLinksAndBranches";
import { ServiceTiles } from "@/components/ServiceTiles";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl, medicalClinicJsonLd } from "@/lib/clinic";
import { specialtiesQueryOptions } from "@/lib/specialties.queries";

const TITLE = "Авиценна — сеть многопрофильных клиник в Бишкеке";
const DESCRIPTION =
  "Поликлиника, травмпункт 24/7, хирургия, лаборатория и стационар в Бишкеке. Онлайн-запись к врачу за минуту.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(specialtiesQueryOptions());
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      {
        property: "og:description",
        content:
          "Приём специалистов, диагностика, анализы и стационар. Круглосуточная запись: +996 779 909 009.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/") || "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") || "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(medicalClinicJsonLd()),
      },
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
