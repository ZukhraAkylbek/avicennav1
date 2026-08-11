import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// TODO: заменить на адрес сайта после привязки домена.
const BASE_URL = "";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { listActiveSpecialties } = await import("@/lib/specialties.server");

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/napravleniya", changefreq: "weekly", priority: "0.9" },
        ];

        try {
          const specialties = await listActiveSpecialties();
          for (const specialty of specialties) {
            const entry: SitemapEntry = {
              path: `/napravleniya/${specialty.slug}`,
              changefreq: "monthly",
              priority: "0.8",
            };
            if (specialty.updated_at) {
              entry.lastmod = new Date(specialty.updated_at).toISOString();
            }
            entries.push(entry);
          }
        } catch (error) {
          console.error(error);
        }

        try {
          const { listPublishedPages } = await import("@/lib/pages.server");
          const pages = await listPublishedPages();
          for (const page of pages) {
            const entry: SitemapEntry = {
              path: page.path,
              changefreq: "monthly",
              priority: "0.7",
            };
            if (page.updated_at) {
              entry.lastmod = new Date(page.updated_at).toISOString();
            }
            entries.push(entry);
          }
        } catch (error) {
          console.error(error);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
