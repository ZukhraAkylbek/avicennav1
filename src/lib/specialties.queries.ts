import { queryOptions } from "@tanstack/react-query";

import { fetchSpecialties, fetchSpecialty } from "./specialties.functions";

export const specialtiesQueryOptions = () =>
  queryOptions({
    queryKey: ["specialties"],
    queryFn: () => fetchSpecialties(),
  });

export const specialtyQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["specialties", slug],
    queryFn: () => fetchSpecialty({ data: { slug } }),
  });
