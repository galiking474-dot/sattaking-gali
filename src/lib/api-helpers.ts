import { after } from "next/server";
import { scrapeMonthlyChart, scrapeHomepage, scrapeSK24Games, scrapeSatta29Chart, scrapeSatta29Homepage } from "./scraper";
import {
  getResultSattaFromFirestore,
  saveResultSattaToFirestore,
  getMonthlyChartFromFirestore,
  saveMonthlyChartToFirestore,
  getHomepageFromFirestore,
  saveHomepageToFirestore,
  getSK24GamesFromFirestore,
  saveSK24GamesToFirestore,
} from "./firebase-cache";
import type { ResultSattaData, MonthlyChartData, HomepageData, SK24GamesData, Satta29ChartData } from "./types";

// ─── Simple In-Memory Cache ───
// Each serverless instance gets its own cache
// TTL keeps data fresh, Firebase is permanent storage

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memCache = new Map<string, CacheEntry<unknown>>();

export function memGet<T>(key: string): T | null {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function memSet<T>(key: string, data: T, ttlSeconds: number): void {
  memCache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

// ─── Staleness Check ───
// Kept short so freshly-declared results surface fast. We never block a user on a
// scrape: stale data is served instantly and refreshed in the background, so a
// short window is cheap.
const STALE_MS = 60 * 1000; // 1 minute

function isStale(scrapedAt: number): boolean {
  return Date.now() - scrapedAt > STALE_MS;
}

// ─── Get ResultSatta first-section data (on-demand) ───
// Flow: Memory cache → Firebase → Scrape
// If Firebase data is stale, scrape fresh in the background & update Firebase.
// This gives real-time freshness with no user wait, even without a cron.

export async function getResultSattaData(): Promise<ResultSattaData | null> {
  // 1. In-memory cache (instant)
  const cached = memGet<ResultSattaData>("resultsatta");
  if (cached) return cached;

  // 2. Firebase
  const firebaseData = await getResultSattaFromFirestore();

  if (firebaseData && !isStale(firebaseData.scrapedAt)) {
    memSet("resultsatta", firebaseData, 30);
    return firebaseData;
  }

  // 3. Stale but present — serve instantly, refresh in the background so the user
  //    never waits. A short mem TTL prevents a refresh stampede within an instance.
  if (firebaseData) {
    memSet("resultsatta", firebaseData, 15);
    after(refreshResultSatta);
    return firebaseData;
  }

  // 4. Nothing cached at all (cold start) — must scrape inline this once.
  return refreshResultSatta();
}

async function refreshResultSatta(): Promise<ResultSattaData | null> {
  try {
    // First-section live board is sourced from satta29.com's homepage.
    const games = await scrapeSatta29Homepage();
    const data: ResultSattaData = { games, scrapedAt: Date.now() };
    memSet("resultsatta", data, 30);
    await saveResultSattaToFirestore(data);
    return data;
  } catch {
    // Scrape failed — fall back to whatever is in memory (stale is better than nothing)
    return memGet<ResultSattaData>("resultsatta");
  }
}

// ─── Get shared LIVE / NEXT / REST data (READ-ONLY from shared Firebase) ───
// This site does NOT scrape satta-king-fast — the other (scraper) site keeps the
// `homepage` doc fresh in the shared Firebase. Here we only read it. If the doc
// isn't there yet, sections simply render empty. No scrape fallback on purpose.

export async function getSharedHomepageData(): Promise<HomepageData | null> {
  const cached = memGet<HomepageData>("shared-homepage");
  if (cached) return cached;

  const firebaseData = await getHomepageFromFirestore();
  if (firebaseData) {
    memSet("shared-homepage", firebaseData, 30);
    return firebaseData;
  }
  return null;
}

// ─── Get Homepage Data (on-demand, SCRAPES satta-king-fast & writes shared doc) ───
// Flow: Memory cache → Firebase → Scrape. Unlike getSharedHomepageData (read-only),
// this is the scraper role: if data is stale/missing it scrapes and updates the
// shared `homepage` doc. Used by the live/next/rest-results backend API routes.

export async function getHomepageData(): Promise<HomepageData | null> {
  // 1. In-memory cache (instant)
  const cached = memGet<HomepageData>("homepage");
  if (cached) return cached;

  // 2. Firebase
  const firebaseData = await getHomepageFromFirestore();

  if (firebaseData && !isStale(firebaseData.scrapedAt)) {
    memSet("homepage", firebaseData, 300);
    return firebaseData;
  }

  // 3. Stale but present — serve instantly, refresh in the background.
  if (firebaseData) {
    memSet("homepage", firebaseData, 15);
    after(refreshHomepage);
    return firebaseData;
  }

  // 4. Nothing cached at all (cold start) — must scrape inline this once.
  return refreshHomepage();
}

async function refreshHomepage(): Promise<HomepageData | null> {
  try {
    const data = await scrapeHomepage();
    const homepage: HomepageData = { ...data, scrapedAt: Date.now() };
    memSet("homepage", homepage, 30);
    await saveHomepageToFirestore(homepage);
    return homepage;
  } catch {
    return memGet<HomepageData>("homepage");
  }
}

// ─── Get Satta King 24 Data (on-demand) ───
// Flow: Memory cache → Firebase → Scrape

export async function getSK24Data(): Promise<SK24GamesData | null> {
  const cached = memGet<SK24GamesData>("sk24-games");
  if (cached) return cached;

  const firebaseData = await getSK24GamesFromFirestore();
  if (firebaseData && !isStale(firebaseData.scrapedAt)) {
    memSet("sk24-games", firebaseData, 300);
    return firebaseData;
  }

  // Stale but present — serve instantly, refresh in the background.
  if (firebaseData) {
    memSet("sk24-games", firebaseData, 15);
    after(refreshSK24);
    return firebaseData;
  }

  // Cold start — scrape inline this once.
  return refreshSK24();
}

async function refreshSK24(): Promise<SK24GamesData | null> {
  try {
    const { games, spotlight } = await scrapeSK24Games();
    const data: SK24GamesData = { games, spotlight, scrapedAt: Date.now() };
    memSet("sk24-games", data, 30);
    await saveSK24GamesToFirestore(data);
    return data;
  } catch {
    return memGet<SK24GamesData>("sk24-games");
  }
}

// ─── Get Monthly Chart Data (on-demand, read from shared Firebase) ───
// Flow: Memory cache → Firebase → Scrape (fallback)

const CHART_STALE_MS = 10 * 60 * 1000; // 10 minutes

export async function getMonthlyChart(
  monthName: string,
  year: string
): Promise<MonthlyChartData | null> {
  const month = monthName.toLowerCase();
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const cacheKey = `chart:${month}:${year}`;

  const cached = memGet<MonthlyChartData>(cacheKey);
  if (cached) return cached;

  const firebaseData = await getMonthlyChartFromFirestore(month, year);
  if (firebaseData && Date.now() - firebaseData.scrapedAt < CHART_STALE_MS) {
    memSet(cacheKey, firebaseData, 120);
    return firebaseData;
  }

  try {
    const results = await scrapeMonthlyChart(month, year);
    const chartData: MonthlyChartData = { month: formattedMonth, year, results, scrapedAt: Date.now() };
    memSet(cacheKey, chartData, 120);
    saveMonthlyChartToFirestore(month, year, chartData).catch(() => {});
    return chartData;
  } catch {
    if (firebaseData) {
      memSet(cacheKey, firebaseData, 60);
      return firebaseData;
    }
    return null;
  }
}

// ─── Get Satta29 Combined Monthly Chart (on-demand) ───
// Flow: Memory cache → Scrape. No Firebase layer — the memory cache + edge cache
// are enough for a chart that changes at most a few times a day.

export async function getSatta29Chart(
  monthName: string,
  year: string
): Promise<Satta29ChartData | null> {
  const month = monthName.toLowerCase();
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const cacheKey = `satta29:${month}:${year}`;

  const cached = memGet<Satta29ChartData>(cacheKey);
  if (cached) return cached;

  try {
    const { games, rows } = await scrapeSatta29Chart(formattedMonth, year);
    const data: Satta29ChartData = {
      month: formattedMonth,
      year,
      games,
      rows,
      scrapedAt: Date.now(),
    };
    // Cache longer for past months (immutable) than the current live month.
    memSet(cacheKey, data, 300);
    return data;
  } catch {
    return null;
  }
}

// ─── Edge Cache Headers ───

export const EDGE_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
  "CDN-Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
  "Vercel-CDN-Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
} as const;

export const CHART_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  "Vercel-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
} as const;
