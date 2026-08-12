import { createFileRoute } from "@tanstack/react-router";

import { BranchesMap } from "@/components/BranchesMap";
import { ConsultCta } from "@/components/ConsultCta";
import { FaqAccordion } from "@/components/FaqAccordion";
import { HeroBanner } from "@/components/HeroBanner";
import { ProcessSteps } from "@/components/ProcessSteps";
import { QuickAccess } from "@/components/QuickAccess";
import { ServiceTiles } from "@/components/ServiceTiles";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StatsBand } from "@/components/StatsBand";
import { WhyUs } from "@/components/WhyUs";
import { absoluteUrl, medicalClinicJsonLd } from "@/lib/clinic";
import { useSiteContent } from "@/lib/site-content";
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
  const { t } = useSiteContent();

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main>
        <HeroBanner
          title={t("hero.title")}
          subtitle={t("hero.subtitle")}
          eyebrow={t("hero.eyebrow")}
          statValue={t("hero.stat_value")}
          statLabel={t("hero.stat_label")}
          secondaryLabel="Все направления"
          secondaryHref="#napravleniya"
        />
        <StatsBand
          stats={[1, 2, 3, 4].map((n) => ({
            value: t(`stats.${n}_value`),
            suffix: t(`stats.${n}_suffix`),
            label: t(`stats.${n}_label`),
          }))}
        />
        <QuickAccess />
        <ServiceTiles />
        <WhyUs />
        <ProcessSteps />
        <QuickLinksAndBranches />
        <FaqAccordion />
        <ConsultCta />
      </main>
      <SiteFooter />
    </div>
  );
}
