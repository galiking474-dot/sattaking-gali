import axios from "axios";
import * as cheerio from "cheerio";
import type { GameResult, ChartRow, SK24Game, SK24Spotlight } from "./types";

const HEADERS = { "User-Agent": "Mozilla/5.0" };
const TIMEOUT = 15_000;

// Extract HTML tables from Next.js RSC streaming payload
// RSC pages embed rendered HTML inside script tags, not in the DOM
function extractRSCHtml(html: string): string {
  // Find all table HTML embedded in the RSC payload or direct DOM
  const tableMatches = html.match(/<table class="newtable"[\s\S]*?<\/table>/g);
  if (tableMatches && tableMatches.length > 0) {
    return tableMatches.join("\n");
  }
  return html;
}

// ─── Homepage Scraper ───
// Scrapes LIVE, NEXT, REST sections from satta-king-fast.com

export async function scrapeHomepage(): Promise<{
  live: GameResult[];
  next: GameResult[];
  rest: GameResult[];
}> {
  const { data } = await axios.get("https://satta-king-fast.com/", {
    headers: HEADERS,
    timeout: TIMEOUT,
  });

  const $ = cheerio.load(data);

  const live: GameResult[] = [];
  const next: GameResult[] = [];
  const rest: GameResult[] = [];

  let currentSection = "";

  $("tr").each((_i, el) => {
    const heading = $(el).find("td.games-name h3").text().trim();

    if (heading === "LIVE" || heading === "NEXT" || heading === "REST") {
      currentSection = heading;
      return;
    }

    if (
      currentSection &&
      ($(el).hasClass("game-result") || $(el).hasClass("game-result highlight"))
    ) {
      const name = $(el).find(".game-name").text().trim();
      if (!name) return;

      const game: GameResult = {
        name,
        time: $(el).find(".game-time").text().replace("at", "").trim(),
        yesterday: $(el).find(".yesterday-number h3").text().trim(),
        today: $(el).find(".today-number h3").text().trim(),
      };

      if (currentSection === "LIVE") live.push(game);
      else if (currentSection === "NEXT") next.push(game);
      else if (currentSection === "REST") rest.push(game);
    }
  });

  return { live, next, rest };
}

// ─── ResultSatta Homepage Scraper ───
// Scrapes the main results board (the "first section") from resultsatta.com.
// Structure: table.quick-result-board > tr.game-result, with the game name/time
// inside td.game-details and the numbers in td.yesterday-number / td.today-number.
// Games are returned in source order — that order is the section we must preserve.

export async function scrapeResultSatta(): Promise<GameResult[]> {
  const { data } = await axios.get("https://resultsatta.com/", {
    headers: HEADERS,
    timeout: TIMEOUT,
  });

  const $ = cheerio.load(data);
  const games: GameResult[] = [];

  // Undeclared cells often hold placeholder text ("wait", "loading") instead of a
  // number — normalise those to empty so the UI shows its own WAIT state / IST gate.
  const cleanNum = (raw: string): string => {
    const t = raw.replace(/\s+/g, " ").trim();
    if (!t || /^(wait|loading|xx|--)$/i.test(t)) return "";
    return t;
  };

  $("table.quick-result-board tr.game-result").each((_i, el) => {
    const name = $(el).find("td.game-details h3.game-name").text().trim();
    if (!name) return;

    const time = $(el)
      .find("td.game-details h3.game-time")
      .text()
      .replace(/^\s*at\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();

    const yesterday = cleanNum($(el).find("td.yesterday-number").text());
    const today = cleanNum($(el).find("td.today-number").text());

    games.push({ name, time, yesterday, today });
  });

  return games;
}

// ─── Monthly Chart Scraper ───

export async function scrapeMonthlyChart(month: string, year: string): Promise<ChartRow[]> {
  const monthMap: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
  };

  const monthNumber = monthMap[month.toLowerCase()];
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  const queryStr = `?ResultFor=${formattedMonth}-${year}&month=${monthNumber}&year=${year}`;

  const [mainRes, sgRes, dbRes] = await Promise.all([
    axios.get(`https://satta-king-fast.com/chart.php${queryStr}`, { headers: HEADERS, timeout: TIMEOUT }),
    axios.get(`https://satta-king-fast.com/shri-ganesh/satta-result-chart/sg/${queryStr}`, { headers: HEADERS, timeout: TIMEOUT }),
    axios.get(`https://satta-king-fast.com/delhi-bazar/satta-result-chart/db/${queryStr}`, { headers: HEADERS, timeout: TIMEOUT }),
  ]);

  function extractColumn(html: string, colAbbr: string): Record<string, string> {
    const $ = cheerio.load(html);
    const cols: string[] = [];
    $("th.name, th[class='name']").each((_i, el) => {
      cols.push($(el).text().trim().toUpperCase());
    });
    const colIndex = cols.indexOf(colAbbr);
    const map: Record<string, string> = {};
    $("tr.day-number").each((_i, el) => {
      const date = $(el).find("td.day").text().trim();
      if (!date) return;
      const numbers = $(el).find("td.number").map((_i, item) => $(item).text().trim()).get();
      if (numbers.length > cols.length) numbers.shift();
      map[date] = colIndex >= 0 ? (numbers[colIndex] || "XX") : "XX";
    });
    return map;
  }

  const srgnMap = extractColumn(sgRes.data, "SRGN");
  const dlbzMap = extractColumn(dbRes.data, "DLBZ");

  const $ = cheerio.load(mainRes.data);
  const results: ChartRow[] = [];

  $("table.chart-table tr.day-number").each((_i, el) => {
    const date = $(el).find("td.day").text().trim();
    let numbers = $(el).find("td.number").map((_i, item) => $(item).text().trim()).get();
    if (numbers.length > 4) numbers.shift();

    if (date) {
      results.push({
        date,
        dswr: numbers[0] || "XX",
        frbd: numbers[1] || "XX",
        gzbd: numbers[2] || "XX",
        gali: numbers[3] || "XX",
        srgn: srgnMap[date] || "XX",
        dlbz: dlbzMap[date] || "XX",
      });
    }
  });

  return results;
}

// ─── Game Chart Scraper ───

// Slug aliases: SK24 game names → satta-king-fast.com slugs
const SLUG_ALIASES: Record<string, string> = {
  desawer: "desawar",
};

export async function scrapeGameChart(slug: string, month?: string, year?: string) {
  const resolvedSlug = SLUG_ALIASES[slug] || slug;

  // Get homepage to find chart URL
  const { data: homeHtml } = await axios.get("https://satta-king-fast.com/", {
    headers: HEADERS,
    timeout: TIMEOUT,
  });

  const $home = cheerio.load(homeHtml);
  let chartUrl = "";
  $home(`a[href*="/${resolvedSlug}/satta-result-chart/"]`).each((_i, el) => {
    if (!chartUrl) chartUrl = $home(el).attr("href") || "";
  });

  if (!chartUrl) return null;

  if (month && year) {
    const monthMap: Record<string, string> = {
      january: "01", february: "02", march: "03", april: "04",
      may: "05", june: "06", july: "07", august: "08",
      september: "09", october: "10", november: "11", december: "12",
    };
    const monthNum = monthMap[month.toLowerCase()];
    const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
    chartUrl += `?month=${monthNum}&year=${year}&ResultFor=${formattedMonth}-${year}`;
  }

  const { data: chartHtml } = await axios.get(chartUrl, {
    headers: HEADERS,
    timeout: TIMEOUT,
  });

  const $ = cheerio.load(chartHtml);
  const chartTitle = $("tr.chart-head td.month h1").text().trim();

  const columns: string[] = [];
  $("tr.date-name th.name").each((_i, el) => {
    columns.push($(el).text().trim().toUpperCase());
  });

  const abbrMap: Record<string, string> = {
    DSWR: "desawar", FRBD: "faridabad", GZBD: "ghaziabad",
    GALI: "gali", SRGN: "shri-ganesh",
  };

  const gameNameUpper = slug.replace(/-/g, " ").toUpperCase();
  let gameColIndex = -1;

  columns.forEach((col, i) => {
    if (abbrMap[col] === slug) gameColIndex = i;
  });
  if (gameColIndex === -1) {
    columns.forEach((col, i) => {
      if (col === gameNameUpper) gameColIndex = i;
    });
  }
  if (gameColIndex === -1) gameColIndex = columns.length - 1;

  const results: { date: string; day: string; result: string }[] = [];

  $("tr.day-number").each((_i, el) => {
    const dayEl = $(el).find("td.day");
    const dateNum = dayEl.text().trim();
    const dateTitle = dayEl.attr("title") || "";
    const numbers = $(el).find("td.number").map((_i, item) => $(item).text().trim()).get();

    if (dateNum) {
      let dayName = "";
      if (dateTitle) {
        try {
          dayName = new Date(dateTitle).toLocaleDateString("en-US", { weekday: "long" });
        } catch { /* skip */ }
      }
      results.push({
        date: dateTitle || dateNum,
        day: dayName,
        result: gameColIndex >= 0 ? (numbers[gameColIndex] || "XX") : (numbers[numbers.length - 1] || "XX"),
      });
    }
  });

  const titleMatch = chartTitle.match(/of\s+(\w+)\s+(\d{4})/);

  return {
    gameName: gameNameUpper,
    chartTitle,
    month: titleMatch?.[1] || "",
    year: titleMatch?.[2] || "",
    columns,
    results,
  };
}

// ─── SK24 Game Chart Scraper ───
// Fallback scraper for games only available on satta-king-24.com

// SK24 abbreviation → full slug mapping
const SK24_ABBR_TO_SLUG: Record<string, string> = {
  ds: "desawer", shdm: "shiv-dham", pkb: "pushkar-bazar",
  "delhi m": "delhi-metro", db: "delhi-bazar", "shri sym": "shri-sayam",
  sg: "shri-ganesh", klb: "kolmbia", fb: "faridabad", mm: "makka-madina",
  gzbd: "ghaziabad", klkn: "kalka-night", gali: "gali",
  "shirdi dham": "shirdi-dham", "sadar bazar": "sadar-bazar",
  "delhi darbar": "delhi-darbar", kaliyar: "kaliyar", gwalior: "gwalior",
  "new ganga": "new-ganga", "delhi matka": "delhi-matka",
  agra: "agra", fthbd: "fatehabad", alwar: "alwar", sktp: "shakti-peeth",
  "mandi bazar": "mandi-bazar", "ghaziabad king": "ghaziabad-king",
  mathura: "mathura", dwarka: "dwarka",
};

export async function scrapeSK24GameChart(slug: string, month?: string, year?: string) {
  const { data: rawHtml } = await axios.get("https://www.satta-king-24.com/chart", {
    headers: HEADERS,
    timeout: TIMEOUT,
  });

  // SK24 uses Next.js RSC streaming — table HTML is inside script tags
  const tableHtml = extractRSCHtml(rawHtml);
  const $ = cheerio.load(tableHtml);
  const gameNameUpper = slug.replace(/-/g, " ").toUpperCase();

  // Find the game column across all tables
  let foundHeaders: string[] = [];
  let foundRows: string[][] = [];
  let gameColIndex = -1;
  let chartTitle = "";

  $("table.newtable").each((_, table) => {
    if (gameColIndex >= 0) return; // already found

    // Find headers — first tr with th elements
    const headers: string[] = [];
    $(table).find("th").each((_, th) => {
      headers.push($(th).text().trim());
    });

    // Check if this table has our game (try exact match, then abbreviation mapping)
    const idx = headers.findIndex((h) => {
      if (h.toUpperCase() === "DATE") return false; // skip DATE column
      const hLower = h.toLowerCase().replace(/\s+/g, "-");
      const hUpper = h.toUpperCase();
      if (hLower === slug || hUpper === gameNameUpper) return true;
      // Check if this abbreviation maps to our slug
      const mappedSlug = SK24_ABBR_TO_SLUG[h.toLowerCase()];
      return mappedSlug === slug;
    });

    if (idx >= 0) {
      gameColIndex = idx;
      foundHeaders = headers;
      chartTitle = headers.filter(h => h.toUpperCase() !== "DATE").join(", ");

      // Collect data rows (tr elements that have td, not th)
      $(table).find("tr").each((_, tr) => {
        const tds = $(tr).find("td");
        if (tds.length === 0) return; // skip header row
        const cells: string[] = [];
        tds.each((_, td) => {
          cells.push($(td).text().trim());
        });
        if (cells.length > 0) foundRows.push(cells);
      });
    }
  });

  if (gameColIndex < 0) return null;

  // Build results array (date + day + result)
  const now = new Date();
  const targetMonth = month ? month.charAt(0).toUpperCase() + month.slice(1).toLowerCase() : now.toLocaleDateString("en-US", { month: "long" });
  const targetYear = year || String(now.getFullYear());

  const results: { date: string; day: string; result: string }[] = [];

  foundRows.forEach((cells) => {
    const dateStr = cells[0] || "";
    // dateStr format: "DD/MM" (e.g., "01/06") or "DD-MM"
    const dateParts = dateStr.split(/[-/]/);
    const dayNum = dateParts[0] || dateStr;
    const rawResult = cells[gameColIndex] || "";
    const gameResult = rawResult === "-" || rawResult === "" ? "XX" : rawResult;

    let dayName = "";
    if (dateParts.length === 2) {
      try {
        const monthNum = parseInt(dateParts[1], 10) - 1;
        const dayNumInt = parseInt(dateParts[0], 10);
        const yearInt = parseInt(targetYear, 10);
        const d = new Date(yearInt, monthNum, dayNumInt);
        dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      } catch { /* skip */ }
    }

    results.push({
      date: dayNum,
      day: dayName,
      result: gameResult,
    });
  });

  return {
    gameName: gameNameUpper,
    chartTitle,
    month: targetMonth,
    year: targetYear,
    columns: foundHeaders,
    results,
  };
}

// ─── Satta King 24 Scraper ───
// Scrapes the live game board + hero spotlight from satta-king-24.com

export async function scrapeSK24Games(): Promise<{ games: SK24Game[]; spotlight: SK24Spotlight }> {
  const { data: html } = await axios.get("https://www.satta-king-24.com/", {
    timeout: 10000,
    headers: HEADERS,
  });

  const $ = cheerio.load(html);
  const games: SK24Game[] = [];

  $("#games .gboardhalf").each((_, el) => {
    const name = $(el).find(".gbgamehalf").text().trim();
    const time = $(el).find(".gbhalftime").text().replace(/[()]/g, "").trim();
    const yesterday = $(el).find(".gbhalfresulto").text().replace(/[\[\]]/g, "").trim();
    const today = $(el).find(".gbhalfresultn").text().replace(/[\[\]]/g, "").trim();

    if (name) {
      games.push({ name, time, yesterday, today });
    }
  });

  // Scrape hero spotlight (upcoming + last declared) from SK24's top section
  let upcomingName = "";
  let declaredName = "";
  let declaredResult = "";

  $(".bg-black .flex.items-center").each((_, el) => {
    const name = $(el).find(".text-white.uppercase").text().trim();
    const hasLoader = $(el).find(".loader").length > 0;
    const result = $(el).find(".text-gray-50 span").text().trim();

    if (hasLoader) {
      upcomingName = name;
    } else if (result) {
      declaredName = name;
      declaredResult = result;
    }
  });

  return { games, spotlight: { upcomingName, declaredName, declaredResult } };
}
