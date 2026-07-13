import { MetadataRoute } from "next";
import { getResultSattaData } from "@/lib/api-helpers";
import { FEATURED_GAMES } from "@/lib/featured-games";

const BASE_URL = "https://sattaking-gali.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const resultSatta = await getResultSattaData();

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
    ...uniqueSlugs.map((slug) => ({
      url: `${BASE_URL}/chart/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
