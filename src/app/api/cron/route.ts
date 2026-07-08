import { NextRequest } from "next/server";
import { scrapeResultSatta } from "@/lib/scraper";
import { saveResultSattaToFirestore } from "@/lib/firebase-cache";
import type { ResultSattaData } from "@/lib/types";

// ─── Cron Job: Scrape resultsatta.com & Save to Firebase ───
// This is the ONLY backend job this site runs. It scrapes the first-section
// results board from resultsatta.com and writes it to the shared Firebase under
// its own `resultsatta_homepage` document. The site's pages then just read from
// Firebase — no user ever waits for a scrape.
//
// Freshness also comes from the on-demand background refresh in api-helpers
// (memory → Firebase → background scrape), so results stay near real-time even
// between cron runs.

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, string> = {};

  try {
    const games = await scrapeResultSatta();
    const data: ResultSattaData = { games, scrapedAt: Date.now() };
    await saveResultSattaToFirestore(data);
    results.resultsatta = `ok (${games.length} games)`;
  } catch (err) {
    results.resultsatta = `failed: ${(err as Error).message}`;
  }

  return Response.json({ status: "ok", timestamp: new Date().toISOString(), results });
}
