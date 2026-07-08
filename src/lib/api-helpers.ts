import { after } from "next/server";
import { scrapeResultSatta, scrapeMonthlyChart } from "./scraper";
import {
  getResultSattaFromFirestore,
  saveResultSattaToFirestore,
  getMonthlyChartFromFirestore,
  saveMonthlyChartToFirestore,
  getHomepageFromFirestore,
} from "./firebase-cache";
import type { ResultSattaData, MonthlyChartData, HomepageData } from "./types";

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
    const games = await scrapeResultSatta();
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
