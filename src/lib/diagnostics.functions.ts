import { createServerFn } from "@tanstack/react-start";

export const fetchDiagnosticsPage = createServerFn({ method: "GET" }).handler(async () => {
  const {
    listDiagnosticsSections,
    listDiagnosticsCategories,
    listDiagnosticsSymptoms,
    listDiagnosticsItems,
  } = await import("./diagnostics.server");

  const [sections, categories, symptoms, items] = await Promise.all([
    listDiagnosticsSections(),
    listDiagnosticsCategories(),
    listDiagnosticsSymptoms(),
    listDiagnosticsItems(),
  ]);

  return { sections, categories, symptoms, items };
});

export const fetchDiagnosticsItem = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug) }))
  .handler(async ({ data }) => {
    const { getDiagnosticsItem } = await import("./diagnostics.server");
    return getDiagnosticsItem(data.slug);
  });
