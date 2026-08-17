import { queryOptions } from "@tanstack/react-query";

import { fetchDiagnosticsItem, fetchDiagnosticsPage } from "./diagnostics.functions";

export const diagnosticsPageQueryOptions = () =>
  queryOptions({
    queryKey: ["diagnostics"],
    queryFn: () => fetchDiagnosticsPage(),
  });

export const diagnosticsItemQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["diagnostics", "item", slug],
    queryFn: () => fetchDiagnosticsItem({ data: { slug } }),
  });
