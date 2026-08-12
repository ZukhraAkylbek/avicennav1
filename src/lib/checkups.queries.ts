import { queryOptions } from "@tanstack/react-query";

import { fetchCheckupCard, fetchCheckupPage } from "./checkups.functions";

export const checkupPageQueryOptions = () =>
  queryOptions({
    queryKey: ["checkups"],
    queryFn: () => fetchCheckupPage(),
  });

export const checkupCardQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["checkups", "card", slug],
    queryFn: () => fetchCheckupCard({ data: { slug } }),
  });
