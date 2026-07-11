import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { memGet, memSet, CHART_CACHE_HEADERS } from "@/lib/api-helpers";
import { getSK24ChartsFromFirestore, saveSK24ChartsToFirestore } from "@/lib/firebase-cache";
import type { SK24ChartTable, SK24ChartsData } from "@/lib/types";

const STALE_MS = 10 * 60 * 1000; // 10 minutes (charts change less frequently)

// Extract HTML tables from Next.js RSC streaming payload
function extractRSCHtml(html: string): string {
  const tableMatches = html.match(/<table class="newtable"[\s\S]*?<\/table>/g);
  if (tableMatches && tableMatches.length > 0) {
    return tableMatches.join("\n");
  }
  return html;
}

async function scrapeSK24Charts(): Promise<SK24ChartTable[]> {
  const { data: rawHtml } = await axios.get("https://www.satta-king-24.com/chart", {
    timeout: 15000,
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  // SK24 uses Next.js RSC streaming — table HTML is inside script tags
  const tableHtml = extractRSCHtml(rawHtml);
  const $ = cheerio.load(tableHtml);
  const tables: SK24ChartTable[] = [];

  $("table.newtable").each((_, table) => {
    // Headers are in the first tr with th elements
    const headers: string[] = [];
    $(table).find("th").each((_, th) => {
      headers.push($(th).text().trim());
    });

    const title = headers.filter(h => h.toUpperCase() !== "DATE").join(", ");

    const rows: string[][] = [];
    $(table).find("tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length === 0) return; // skip header row
      const cells: string[] = [];
      tds.each((_, td) => {
        const text = $(td).text().trim();
        cells.push(text === "-" ? "" : text);
      });
      if (cells.length > 0) {
        rows.push(cells);
      }
    });

    if (headers.length > 0) {
      tables.push({ title, headers, rows });
    }
  });

  return tables;
}

export async function GET() {
  try {
    // 1. In-memory cache
    const cached = memGet<SK24ChartsData>("sk24-charts");
    if (cached) {
      return NextResponse.json(
        { success: true, tables: cached.tables },
        { headers: CHART_CACHE_HEADERS }
      );
    }

    // 2. Firebase
    const firebaseData = await getSK24ChartsFromFirestore();
    if (firebaseData && Date.now() - firebaseData.scrapedAt < STALE_MS) {
      memSet("sk24-charts", firebaseData, 300);
      return NextResponse.json(
        { success: true, tables: firebaseData.tables },
        { headers: CHART_CACHE_HEADERS }
      );
    }

    // 3. Scrape fresh (only first user hits this)
    const tables = await scrapeSK24Charts();
    const data: SK24ChartsData = { tables, scrapedAt: Date.now() };
    memSet("sk24-charts", data, 300);

    // Save to Firebase in background
    saveSK24ChartsToFirestore(data).catch(() => {});

    return NextResponse.json(
      { success: true, tables },
      { headers: CHART_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("SK24 chart scrape error:", err);
    // Return stale Firebase data if scrape fails
    const stale = await getSK24ChartsFromFirestore();
    if (stale) {
      memSet("sk24-charts", stale, 60);
      return NextResponse.json(
        { success: true, tables: stale.tables },
        { headers: CHART_CACHE_HEADERS }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
