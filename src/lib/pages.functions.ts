import { createServerFn } from "@tanstack/react-start";

export const fetchPages = createServerFn({ method: "GET" }).handler(async () => {
  const { listPublishedPages } = await import("./pages.server");
  return listPublishedPages();
});

export const fetchPage = createServerFn({ method: "GET" })
  .inputValidator((data: { path: string }) => ({ path: String(data.path) }))
  .handler(async ({ data }) => {
    const { getPageByPath } = await import("./pages.server");
    return getPageByPath(data.path);
  });

export const fetchSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { getSiteSettings } = await import("./pages.server");
  return getSiteSettings();
});
