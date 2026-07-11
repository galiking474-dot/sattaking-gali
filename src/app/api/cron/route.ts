import { NextRequest } from "next/server";
import { scrapeResultSatta, scrapeHomepage, scrapeMonthlyChart, scrapeSK24Games, scrapeGameChart, scrapeSK24GameChart } from "@/lib/scraper";
import { saveResultSattaToFirestore, saveHomepageToFirestore, saveMonthlyChartToFirestore, saveSK24GamesToFirestore, saveGameChartToFirestore } from "@/lib/firebase-cache";
import type { ResultSattaData, HomepageData, MonthlyChartData, SK24GamesData, GameChartData } from "@/lib/types";

// ─── Cron Job: Scrape & Save to Firebase ───
// Runs the full scrape pipeline on this site's own Firebase:
//   1. resultsatta.com first-section board (`resultsatta_homepage` doc)
//   2. satta-king-fast homepage LIVE/NEXT/REST (`homepage` doc)
//   3. Satta King 24 games board
//   4. current month chart + core game charts (kept warm so chart pages never
//      scrape on a user request)
// The site's pages then just read from Firebase — no user ever waits for a scrape.

// Charts for the marquee games — the most-viewed chart pages. Pre-scraping them
// here keeps them warm in Firebase so their chart pages NEVER scrape on a user
// request. (Long-tail games fall back to a one-time scrape-on-first-view.)
const CORE_CHART_SLUGS = ["gali", "desawar", "faridabad", "ghaziabad", "delhi-bazar", "shri-ganesh"];

// The chart pass can add a few seconds; give the function headroom.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, string> = {};

  // 1. ResultSatta first-section board
  try {
    const games = await scrapeResultSatta();
    const data: ResultSattaData = { games, scrapedAt: Date.now() };
    await saveResultSattaToFirestore(data);
    results.resultsatta = `ok (${games.length} games)`;
  } catch (err) {
    results.resultsatta = `failed: ${(err as Error).message}`;
  }

  // 2. Homepage (LIVE/NEXT/REST)
  try {
    const homepage = await scrapeHomepage();
    const data: HomepageData = { ...homepage, scrapedAt: Date.now() };
    await saveHomepageToFirestore(data);
    results.homepage = `ok (live:${homepage.live.length} next:${homepage.next.length} rest:${homepage.rest.length})`;
  } catch (err) {
    results.homepage = `failed: ${(err as Error).message}`;
  }

  // 3. Satta King 24 games (the "Today Satta King Result 2026" board)
  try {
    const { games, spotlight } = await scrapeSK24Games();
    const data: SK24GamesData = { games, spotlight, scrapedAt: Date.now() };
    await saveSK24GamesToFirestore(data);
    results.sk24 = `ok (${games.length} games)`;
  } catch (err) {
    results.sk24 = `failed: ${(err as Error).message}`;
  }

  // 4. Current month chart
  try {
    const now = new Date();
    const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    const month = months[now.getMonth()];
    const year = now.getFullYear().toString();
    const chart = await scrapeMonthlyChart(month, year);
    const data: MonthlyChartData = {
      month: month.charAt(0).toUpperCase() + month.slice(1),
      year,
      results: chart,
      scrapedAt: Date.now(),
    };
    await saveMonthlyChartToFirestore(month, year, data);
    results.chart = `ok (${chart.length} rows)`;
  } catch (err) {
    results.chart = `failed: ${(err as Error).message}`;
  }

  // 5. Core game charts (current month) — keep the popular chart pages warm in
  //    Firebase so they never scrape on a user request. Done in parallel so this
  //    adds ~one scrape's worth of time, not six.
  try {
    const now = new Date();
    const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    const month = months[now.getMonth()];
    const year = now.getFullYear().toString();

    const settled = await Promise.allSettled(
      CORE_CHART_SLUGS.map(async (slug) => {
        let result = await scrapeGameChart(slug, month, year);
        if (!result) result = await scrapeSK24GameChart(slug, month, year);
        if (result && result.results?.length) {
          const data: GameChartData = { ...result, scrapedAt: Date.now() };
          await saveGameChartToFirestore(slug, month, year, data);
          return true;
        }
        return false;
      })
    );
    const ok = settled.filter((s) => s.status === "fulfilled" && s.value).length;
    results.charts = `ok (${ok}/${CORE_CHART_SLUGS.length})`;
  } catch (err) {
    results.charts = `failed: ${(err as Error).message}`;
  }

  return Response.json({ status: "ok", timestamp: new Date().toISOString(), results });
}
