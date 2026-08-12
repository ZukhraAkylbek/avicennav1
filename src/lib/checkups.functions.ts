import { createServerFn } from "@tanstack/react-start";

export const fetchCheckupPage = createServerFn({ method: "GET" }).handler(async () => {
  const { listCheckupSections, listCheckupCards } = await import("./checkups.server");
  const [sections, cards] = await Promise.all([listCheckupSections(), listCheckupCards()]);
  return { sections, cards };
});

export const fetchCheckupCard = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug) }))
  .handler(async ({ data }) => {
    const { getCheckupCard } = await import("./checkups.server");
    return getCheckupCard(data.slug);
  });
