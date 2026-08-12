/**
 * Данные клиники для JSON-LD разметки и контактных блоков.
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
      name: "Авиценна — ул. Бакаева, 106",
      street: "ул. Бакаева, 106",
      city: "Бишкек",
      region: "Чуйская область",
      postalCode: "720000",
      country: "KG",
      latitude: 42.844_4,
      longitude: 74.621_6,
    },
    {
      name: "Авиценна — ул. Джунусалиева, 83",
      street: "ул. Джунусалиева, 83",
      city: "Бишкек",
      region: "Чуйская область",
      postalCode: "720000",
      country: "KG",
      latitude: 42.856_7,
      longitude: 74.607_3,
    },
    {
      name: "Авиценна — ул. Жукеева-Пудовкина, 124",
      street: "ул. Жукеева-Пудовкина, 124",
      city: "Бишкек",
      region: "Чуйская область",
      postalCode: "720000",
      country: "KG",
      latitude: 42.852_1,
      longitude: 74.585_4,
    },
    {
      name: "Авиценна — ул. Московская, 136",
      street: "ул. Московская, 136",
      city: "Бишкек",
      region: "Чуйская область",
      postalCode: "720000",
      country: "KG",
      latitude: 42.858_9,
      longitude: 74.599_8,
    },
    {
      name: "Авиценна — ул. Юнусалиева, 173А, блок А",
      street: "ул. Юнусалиева, 173А, блок А",
      city: "Бишкек",
      region: "Чуйская область",
      postalCode: "720000",
      country: "KG",
      latitude: 42.865_3,
      longitude: 74.617_5,
    },
    {
      name: "Авиценна — пр. Жибек-Жолу, 213",
      street: "пр. Жибек-Жолу, 213",
      city: "Бишкек",
      region: "Чуйская область",
      postalCode: "720000",
      country: "KG",
      latitude: 42.871_2,
      longitude: 74.615_1,
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

export function googleMapsUrl(latitude: number, longitude: number, label?: string) {
  const query = label ? `${label}, ${latitude}, ${longitude}` : `${latitude},${longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function googleMapsDirectionsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export function doubleGisSearchUrl(address: string) {
  return `https://2gis.kg/bishkek/search/${encodeURIComponent(address)}`;
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
