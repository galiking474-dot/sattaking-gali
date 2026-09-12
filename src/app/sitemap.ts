import { MetadataRoute } from "next";
import { getResultSattaData } from "@/lib/api-helpers";
import { FEATURED_GAMES } from "@/lib/featured-games";
import { ARCHIVE_GAMES, ARCHIVE_YEARS, getArchivePath } from "@/lib/archive-games";
import { getAllPosts } from "@/lib/blog-data";

const BASE_URL = "https://sattaking-gali.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const resultSatta = await getResultSattaData();
  const blogPosts = getAllPosts();

  // Build chart URLs from the live first-section game list.
  const uniqueSlugs = [
    ...new Set(
      (resultSatta?.games || []).map((g) =>
        g.name.toLowerCase().replace(/\s+/g, "-")
      )
    ),
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/charts`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    ...staticRoutes,
    // Featured market landing pages (result + yearly chart + Khaiwal + SEO).
    ...FEATURED_GAMES.map((g) => ({
      url: `${BASE_URL}/${g.slug}-result`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...blogPosts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...ARCHIVE_GAMES.flatMap((game) =>
      ARCHIVE_YEARS.map((year) => ({
        url: `${BASE_URL}${getArchivePath(game.slug, year)}`,
        lastModified:
          year === 2026 ? new Date() : new Date(`${year}-12-31T00:00:00Z`),
        changeFrequency: "yearly" as const,
        priority: year === 2026 ? 0.8 : 0.65,
      }))
    ),
    ...uniqueSlugs.map((slug) => ({
      url: `${BASE_URL}/chart/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
