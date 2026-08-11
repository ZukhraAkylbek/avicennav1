import { queryOptions } from "@tanstack/react-query";

import { fetchPage, fetchPages, fetchSiteSettings } from "./pages.functions";

export const pagesQueryOptions = () =>
  queryOptions({
    queryKey: ["pages"],
    queryFn: () => fetchPages(),
  });

export const pageQueryOptions = (path: string) =>
  queryOptions({
    queryKey: ["pages", path],
    queryFn: () => fetchPage({ data: { path } }),
  });

export const siteSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ["site-settings"],
    queryFn: () => fetchSiteSettings(),
  });
