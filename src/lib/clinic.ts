/**
 * Данные клиники для JSON-LD разметки и контактных блоков.
 * Замените адреса/часы на актуальные при запуске.
 */
export const CLINIC = {
  name: "Сеть многопрофильных клиник «Авиценна»",
  legalName: "Авиценна",
  description:
    "Сеть многопрофильных клиник в Бишкеке: поликлиника, травмпункт 24/7, хирургия, лаборатория, стационар.",
  phones: ["+996779909009"],
  email: "info@avicenna.kg",
  branches: [
    {
      name: "Авиценна — Центральный филиал",
      street: "ул. Медицинская, 1",
      city: "Бишкек",
      region: "Чуйская область",
      postalCode: "720000",
      country: "KG",
      latitude: 42.8746,
      longitude: 74.5698,
    },
    {
      name: "Авиценна — Филиал Джал",
      street: "мкр. Джал, 23",
      city: "Бишкек",
      region: "Чуйская область",
      postalCode: "720000",
      country: "KG",
      latitude: 42.8207,
      longitude: 74.5834,
    },
  ],
  /** Травмпункт круглосуточно, поликлиника 08:00–20:00. */
  openingHours: [
    { days: ["Mo", "Tu", "We", "Th", "Fr"], opens: "08:00", closes: "20:00" },
    { days: ["Sa", "Su"], opens: "09:00", closes: "18:00" },
  ],
} as const;

/** Базовый адрес сайта. TODO: заполнить после привязки домена. */
export const BASE_URL = "";

export const absoluteUrl = (path: string) => `${BASE_URL}${path}`;

export function medicalClinicJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalOrganization", "MedicalClinic"],
    name: CLINIC.name,
    legalName: CLINIC.legalName,
    description: CLINIC.description,
    url: absoluteUrl("/") || undefined,
    telephone: CLINIC.phones[0],
    email: CLINIC.email,
    medicalSpecialty: [
      "Urologic",
      "Gastroenterologic",
      "Cardiovascular",
      "Neurologic",
      "Gynecologic",
      "Surgical",
      "Pediatric",
      "Endocrine",
    ],
    address: CLINIC.branches.map((b) => ({
      "@type": "PostalAddress",
      streetAddress: b.street,
      addressLocality: b.city,
      addressRegion: b.region,
      postalCode: b.postalCode,
      addressCountry: b.country,
    })),
    location: CLINIC.branches.map((b) => ({
      "@type": "Place",
      name: b.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: b.street,
        addressLocality: b.city,
        addressCountry: b.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: b.latitude,
        longitude: b.longitude,
      },
    })),
    openingHoursSpecification: CLINIC.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => `https://schema.org/${dayName(d)}`),
      opens: h.opens,
      closes: h.closes,
    })),
    contactPoint: CLINIC.phones.map((phone) => ({
      "@type": "ContactPoint",
      telephone: phone,
      contactType: "customer service",
      availableLanguage: ["ru", "ky"],
    })),
  };
}

const DAY_NAMES: Record<string, string> = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};

function dayName(short: string) {
  return DAY_NAMES[short] ?? short;
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function physicianJsonLd(doctor: {
  full_name: string;
  job_title: string | null;
  photo_url: string | null;
  bio: string | null;
  education: string | null;
  specialtyName: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.full_name,
    jobTitle: doctor.job_title ?? undefined,
    image: doctor.photo_url ?? undefined,
    description: doctor.bio ?? undefined,
    alumniOf: doctor.education ?? undefined,
    medicalSpecialty: doctor.specialtyName,
    url: doctor.url || undefined,
    worksFor: { "@type": "MedicalClinic", name: CLINIC.name },
    address: {
      "@type": "PostalAddress",
      streetAddress: CLINIC.branches[0].street,
      addressLocality: CLINIC.branches[0].city,
      addressCountry: CLINIC.branches[0].country,
    },
    telephone: CLINIC.phones[0],
  };
}
