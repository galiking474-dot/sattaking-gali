import type { MetadataRoute } from "next";
import { FEATURED_GAMES } from "@/lib/featured-games";
import {
  ARCHIVE_GAMES,
  ARCHIVE_YEARS,
  getArchivePath,
} from "@/lib/archive-games";
import { getAllPosts } from "@/lib/blog-data";
import { absoluteUrl } from "@/lib/site";
import { CHART_CONTENT_SLUGS } from "@/lib/chart-page-content";

const CONTENT_UPDATED = new Date("2026-09-22T00:00:00+05:30");
const LEGAL_UPDATED = new Date("2026-05-01T00:00:00+05:30");

export default function sitemap(): MetadataRoute.Sitemap {
  const istDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const dailyUpdated = new Date(`${istDate}T00:00:00+05:30`);
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: dailyUpdated, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/charts"), lastModified: dailyUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/result-timings"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blog"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: CONTENT_UPDATED, changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/disclaimer"), lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];
  const chartSlugs = [
    ...new Set([
      ...ARCHIVE_GAMES.map((game) => game.slug),
      ...CHART_CONTENT_SLUGS,
    ]),
  ];

  return [
    ...staticRoutes,
    ...FEATURED_GAMES.map((game) => ({
      url: absoluteUrl(`/${game.slug}-result`),
      lastModified: dailyUpdated,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...chartSlugs.map((slug) => ({
      url: absoluteUrl(`/chart/${slug}`),
      lastModified: dailyUpdated,
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
    ...getAllPosts().map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(`${post.date}T00:00:00+05:30`),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...ARCHIVE_GAMES.flatMap((game) =>
      ARCHIVE_YEARS.map((year) => ({
        url: absoluteUrl(getArchivePath(game.slug, year)),
        lastModified:
          year === 2026 ? dailyUpdated : new Date(`${year}-12-31T00:00:00Z`),
        changeFrequency: year === 2026 ? ("monthly" as const) : ("yearly" as const),
        priority: year === 2026 ? 0.8 : 0.6,
      })),
    ),
  ];
}
