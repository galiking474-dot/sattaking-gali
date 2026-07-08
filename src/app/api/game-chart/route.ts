import { NextRequest } from "next/server";
import { after } from "next/server";
import { scrapeGameChart, scrapeSK24GameChart } from "@/lib/scraper";
import { getGameChartFromFirestore, saveGameChartToFirestore } from "@/lib/firebase-cache";
import type { GameChartData } from "@/lib/types";
import { memGet, memSet, CHART_CACHE_HEADERS } from "@/lib/api-helpers";

// Homepage uses Hinglish display spellings, but Firebase + the source site
// store charts under canonical slugs. Normalize before any lookup so the
// "Chart →" links for these games resolve correctly.
const SLUG_ALIASES: Record<string, string> = {
  fridabad: "faridabad",
  "faridabad-day": "faridabad",
  frbd: "faridabad",
  gaziabad: "ghaziabad",
  gzbd: "ghaziabad",
  disawar: "desawar",
  desawer: "desawar",
  dswr: "desawar",
  "shree-ganesh": "shri-ganesh",
  shreeganesh: "shri-ganesh",
  srgn: "shri-ganesh",
  "delhi-bazar": "delhi-bazar",
  dlbz: "delhi-bazar",
};

// A chart in Firebase is considered fresh for this long. While fresh we never
// touch the source at all; once stale we refresh in the background (the visitor
// still gets an instant response). This makes source requests independent of
// traffic — the site can never DDoS the source no matter how many users open charts.
const CHART_STALE_MS = 15 * 60 * 1000; // 15 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSlug = searchParams.get("slug");
  const month = searchParams.get("month") || undefined;
  const year = searchParams.get("year") || undefined;

  if (!rawSlug) {
    return Response.json({ success: false, error: "slug is required" }, { status: 400 });
  }

  const slug = SLUG_ALIASES[rawSlug.toLowerCase()] || rawSlug.toLowerCase();
  const cacheKey = `game:${slug}:${month || "current"}:${year || "current"}`;

  // 1. In-memory cache (instant, per-instance).
  const cached = memGet<GameChartData>(cacheKey);
  if (cached) {
    return Response.json({ success: true, ...cached }, { headers: CHART_CACHE_HEADERS });
  }

  // 2. Firebase-first — the shared cache is the authoritative read path. No
  //    scraping happens here on the hot path, so traffic never reaches the source.
  const firebaseData = await getGameChartFromFirestore(slug, month, year);
  if (firebaseData && firebaseData.results?.length) {
    memSet(cacheKey, firebaseData, 300);
    // If it has gone stale, refresh in the background (bounded to ~1 scrape / 15min
    // per game, regardless of how many visitors are viewing it right now).
    if (Date.now() - (firebaseData.scrapedAt || 0) > CHART_STALE_MS) {
      after(() => refreshGameChart(slug, month, year, cacheKey));
    }
    return Response.json({ success: true, ...firebaseData }, { headers: CHART_CACHE_HEADERS });
  }

  // 3. Nothing cached anywhere (a game/month never seen before) — scrape once,
  //    save it to the shared cache, then serve. Every later view reads Firebase.
  const fresh = await refreshGameChart(slug, month, year, cacheKey);
  if (fresh) {
    return Response.json({ success: true, ...fresh }, { headers: CHART_CACHE_HEADERS });
  }

  return Response.json({ success: false, error: "Game not found" }, { status: 404 });
}

// Scrape the source, cache it in memory, and persist to the shared Firebase so
// the other site benefits too. Returns null if the scrape yields nothing.
async function refreshGameChart(
  slug: string,
  month: string | undefined,
  year: string | undefined,
  cacheKey: string
): Promise<GameChartData | null> {
  try {
    let result = await scrapeGameChart(slug, month, year);
    if (!result) {
      result = await scrapeSK24GameChart(slug, month, year);
    }
    if (result && result.results?.length) {
      const data: GameChartData = { ...result, scrapedAt: Date.now() };
      memSet(cacheKey, data, 300);
      await saveGameChartToFirestore(slug, month, year, data);
      return data;
    }
  } catch (error) {
    console.error("[game-chart] scrape failed:", (error as Error).message);
  }
  return null;
}
