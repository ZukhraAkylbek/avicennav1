import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ChevronRight, Phone } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
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
        <h1 className="text-brand-green-dark text-4xl font-extrabold">Направление не найдено</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Возможно, страница переехала. Посмотрите все направления клиники.
        </p>
        <Link
          to="/napravleniya"
          className="bg-brand-terracotta text-brand-white mt-8 inline-flex rounded-full px-8 py-4 text-lg font-bold"
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
        <section className="bg-tile-mint py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <nav aria-label="Хлебные крошки" className="text-brand-green-dark/80 text-base">
              <Link to="/" className="hover:underline">
                Главная
              </Link>
              <span className="mx-2">/</span>
              <Link to="/napravleniya" className="hover:underline">
                Направления
              </Link>
            </nav>
            <h1 className="text-brand-green-dark mt-4 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              {data.h1_title}
            </h1>
            {data.intro && (
              <p className="text-brand-green-dark/90 mt-5 max-w-3xl text-xl sm:text-2xl">
                {data.intro}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-terracotta text-brand-white rounded-full px-8 py-4 text-lg font-bold sm:text-xl"
              >
                Записаться онлайн
              </a>
              <a
                href={`tel:${CLINIC.phones[0]}`}
                className="bg-brand-green-dark text-brand-white inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold"
              >
                <Phone className="size-5" aria-hidden="true" />
                {CLINIC.phones[0]}
              </a>
            </div>
          </div>
        </section>

        {data.body && (
          <section className="py-10 sm:py-14">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <h2 className="text-brand-green-dark text-3xl font-extrabold sm:text-4xl">
                Что мы делаем
              </h2>
              <p className="text-foreground mt-4 text-lg leading-relaxed sm:text-xl">{data.body}</p>
            </div>
          </section>
        )}

        {data.doctors.length > 0 && (
          <section className="bg-tile-sky/40 py-10 sm:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <h2 className="text-brand-green-dark text-3xl font-extrabold sm:text-4xl">Врачи</h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.doctors.map((doctor) => (
                  <article
                    key={doctor.slug}
                    className="bg-background rounded-3xl p-6 shadow-sm"
                    itemScope
                    itemType="https://schema.org/Physician"
                  >
                    <h3 className="text-brand-green-dark text-2xl font-bold" itemProp="name">
                      {doctor.full_name}
                    </h3>
                    {doctor.job_title && (
                      <p className="text-muted-foreground mt-1 text-lg" itemProp="jobTitle">
                        {doctor.job_title}
                      </p>
                    )}
                    {doctor.experience_years != null && (
                      <p className="text-foreground mt-2 text-base">
                        Стаж: {doctor.experience_years} лет
                      </p>
                    )}
                    {doctor.bio && (
                      <p className="text-foreground mt-3 text-base" itemProp="description">
                        {doctor.bio}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {data.faqs.length > 0 && (
          <section className="py-10 sm:py-14">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <h2 className="text-brand-green-dark text-3xl font-extrabold sm:text-4xl">
                Частые вопросы
              </h2>
              <dl className="mt-8 space-y-5">
                {data.faqs.map((faq) => (
                  <div key={faq.question} className="bg-tile-cream rounded-3xl p-6">
                    <dt className="text-brand-green-dark text-xl font-bold sm:text-2xl">
                      {faq.question}
                    </dt>
                    <dd className="text-foreground mt-3 text-lg">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        <section className="pb-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Link
              to="/napravleniya"
              className="text-brand-green-dark inline-flex items-center gap-2 text-xl font-bold hover:underline"
            >
              Все направления
              <ChevronRight className="size-6" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
