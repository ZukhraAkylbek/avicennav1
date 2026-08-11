import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ChevronRight, Phone } from "lucide-react";

import { ConsultCta } from "@/components/ConsultCta";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhyUs } from "@/components/WhyUs";
import { CLINIC, absoluteUrl, faqPageJsonLd, physicianJsonLd } from "@/lib/clinic";
import { BOOKING_URL } from "@/lib/site-config";
import { specialtyQueryOptions } from "@/lib/specialties.queries";

const truncate = (value: string, max = 158) =>
  value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;

export const Route = createFileRoute("/napravleniya/$slug")({
  loader: async ({ params, context }) => {
    const specialty = await context.queryClient.ensureQueryData(
      specialtyQueryOptions(params.slug),
    );
    if (!specialty) throw notFound();
    return specialty;
  },
  head: ({ params, loaderData }) => {
    const path = `/napravleniya/${params.slug}`;

    if (!loaderData) {
      return {
        meta: [{ title: "Страница недоступна — Авиценна" }, { name: "robots", content: "noindex" }],
      };
    }

    // Фолбэк: если meta-поля в базе пустые, генерируем из h1_title / intro.
    const title = loaderData.meta_title?.trim() || `${loaderData.h1_title} — клиника «Авиценна»`;
    const description =
      loaderData.meta_description?.trim() ||
      truncate(
        loaderData.intro?.trim() ||
          `${loaderData.h1_title}: консультация, диагностика и лечение в клинике «Авиценна». Онлайн-запись и приём каждый день.`,
      );

    const faqs = loaderData.faqs;
    const doctors = loaderData.doctors;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: absoluteUrl(path) || path },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(path) || path }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            name: loaderData.h1_title,
            description,
            url: absoluteUrl(path) || path,
            about: { "@type": "MedicalSpecialty", name: loaderData.name },
            provider: { "@type": "MedicalClinic", name: CLINIC.name },
          }),
        },
        ...(faqs.length > 0
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify(faqPageJsonLd(faqs)),
              },
            ]
          : []),
        ...doctors.map((doctor) => ({
          type: "application/ld+json",
          children: JSON.stringify(
            physicianJsonLd({
              ...doctor,
              specialtyName: loaderData.name,
              url: absoluteUrl(path) || path,
            }),
          ),
        })),
      ],
    };
  },
  component: SpecialtyPage,
  notFoundComponent: () => (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-foreground text-4xl font-extrabold">Направление не найдено</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Возможно, страница переехала. Посмотрите все направления клиники.
        </p>
        <Link
          to="/napravleniya"
          className="bg-accent text-accent-foreground mt-8 inline-flex rounded-md px-7 py-4 text-base font-semibold"
        >
          Все направления
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
});

function SpecialtyPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(specialtyQueryOptions(slug));
  if (!data) return null;

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main>
        <section className="border-border border-b">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:py-16">
            <div>
              <nav aria-label="Хлебные крошки" className="text-muted-foreground text-sm">
                <Link to="/" className="hover:text-foreground">
                  Главная
                </Link>
                <span className="mx-2">/</span>
                <Link to="/napravleniya" className="hover:text-foreground">
                  Направления
                </Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">{data.name}</span>
              </nav>
              <h1 className="text-foreground mt-5 text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-6xl">
                {data.h1_title}
              </h1>
              {data.intro && (
                <p className="text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl">
                  {data.intro}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent text-accent-foreground rounded-md px-7 py-4 text-base font-semibold transition-opacity hover:opacity-90"
                >
                  Записаться на приём
                </a>
                <a
                  href={`tel:${CLINIC.phones[0]}`}
                  className="border-border text-foreground hover:border-foreground inline-flex items-center gap-2 rounded-md border px-7 py-4 text-base font-semibold transition-colors"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  +996 779 909 009
                </a>
              </div>
            </div>

            <dl className="border-border grid content-start gap-px self-start border sm:grid-cols-2 lg:grid-cols-1">
              {[
                { term: "Врачей направления", value: String(data.doctors.length || "—") },
                { term: "Приём", value: "По записи, без очереди" },
                { term: "Филиалы", value: "2 в Бишкеке" },
              ].map((item) => (
                <div key={item.term} className="border-border border p-5">
                  <dt className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
                    {item.term}
                  </dt>
                  <dd className="text-foreground mt-2 text-lg font-bold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {data.body && (
          <section className="border-border border-b py-14 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <p className="eyebrow">О направлении</p>
              <h2 className="text-foreground mt-3 text-3xl font-extrabold sm:text-4xl">
                Что мы лечим
              </h2>
              <p className="text-muted-foreground mt-5 text-lg leading-relaxed">{data.body}</p>
            </div>
          </section>
        )}

        {data.doctors.length > 0 && (
          <section className="border-border border-b py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <SectionHeading eyebrow="Специалисты" title="Врачи направления" />
              <div className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
                {data.doctors.map((doctor) => (
                  <article
                    key={doctor.slug}
                    className="border-border hover:bg-surface-soft border p-6 transition-colors"
                    itemScope
                    itemType="https://schema.org/Physician"
                  >
                    <h3 className="text-foreground text-xl font-bold" itemProp="name">
                      {doctor.full_name}
                    </h3>
                    {doctor.job_title && (
                      <p className="text-brand-green mt-1 text-sm font-semibold" itemProp="jobTitle">
                        {doctor.job_title}
                      </p>
                    )}
                    {doctor.experience_years != null && (
                      <p className="text-muted-foreground mt-3 text-sm">
                        Стаж: {doctor.experience_years} лет
                      </p>
                    )}
                    {doctor.bio && (
                      <p
                        className="text-muted-foreground mt-3 text-base leading-relaxed"
                        itemProp="description"
                      >
                        {doctor.bio}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <ProcessSteps title={`Как проходит приём: ${data.name.toLowerCase()}`} />
        <WhyUs />
        <FaqAccordion faqs={data.faqs} />
        <ConsultCta defaultSlug={slug} />

        <section className="border-border border-t py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Link
              to="/napravleniya"
              className="text-foreground hover:text-brand-green inline-flex items-center gap-2 text-lg font-bold"
            >
              Все направления
              <ChevronRight className="size-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

