import { createServerFn } from "@tanstack/react-start";

export const fetchSpecialties = createServerFn({ method: "GET" }).handler(async () => {
  const { listActiveSpecialties } = await import("./specialties.server");
  return listActiveSpecialties();
});

export const fetchSpecialty = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug) }))
  .handler(async ({ data }) => {
    const { getSpecialtyBySlug } = await import("./specialties.server");
    return getSpecialtyBySlug(data.slug);
  });
