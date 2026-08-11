import { createFileRoute } from "@tanstack/react-router";

import { ConsultCta } from "@/components/ConsultCta";
import { FaqAccordion } from "@/components/FaqAccordion";
import { HeroBanner } from "@/components/HeroBanner";
import { ProcessSteps } from "@/components/ProcessSteps";
import { QuickAccess } from "@/components/QuickAccess";
import { QuickLinksAndBranches } from "@/components/QuickLinksAndBranches";
import { ServiceTiles } from "@/components/ServiceTiles";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StatsBand } from "@/components/StatsBand";
import { WhyUs } from "@/components/WhyUs";
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
        <HeroBanner
          title="Медицинская помощь, которой можно доверять"
          subtitle="Сеть многопрофильных клиник «Авиценна» в Бишкеке: приём специалистов, диагностика, хирургия, травмпункт и стационар — круглосуточно."
          eyebrow="Клиники «Авиценна» · Бишкек"
          statValue="15+ лет"
          statLabel="заботимся о здоровье пациентов"
          secondaryLabel="Все направления"
          secondaryHref="#napravleniya"
        />
        <StatsBand
          stats={[
            { value: "9 направлений", label: "от терапии до хирургии" },
            { value: "24/7", label: "травмпункт и стационар" },
            { value: "2 филиала", label: "в Бишкеке" },
          ]}
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
