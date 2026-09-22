import mongoose, { type Connection } from "mongoose";
import dns from "node:dns";
import { unstable_cache } from "next/cache";

const LUCKY_SATTA_GAME_NAMES: Record<string, string> = {
  disawer: "DESAWAR",
  "shirdi-dham": "SHIRDI DHAM",
  kaliyar: "KALIYAR",
  "delhi-bazar": "DELHI BAZAR",
  "shri-ganesh": "SHREE GANESH",
  faridabad: "FARIDABAD",
  "shakti-peeth": "SHAKTI PEETH",
  gaziyabad: "GHAZIABAD",
  mathura: "MATHURA",
  gali: "GALI",
};

interface LuckySattaResultDocument {
  game?: unknown;
  date?: unknown;
  resultNumber?: unknown;
  updatedAt?: Date;
}

export interface LuckySattaDailyResult {
  gameKey: string;
  gameName: string;
  today: string;
  yesterday: string;
}

export interface LuckySattaArchiveRecord {
  date: string;
  result: string;
}

type LuckySattaConnectionCache = {
  connection: Connection | null;
  promise: Promise<Connection> | null;
};

declare global {
  var luckySattaMongo: LuckySattaConnectionCache | undefined;
}

const connectionCache = globalThis.luckySattaMongo ?? {
  connection: null,
  promise: null,
};

globalThis.luckySattaMongo = connectionCache;

function getMongoUri(): string | undefined {
  return process.env.LUCKY_SATTA_MONGODB_URI || process.env.MONGODB_URI;
}

async function getConnection(): Promise<Connection> {
  if (connectionCache.connection?.readyState === 1) {
    return connectionCache.connection;
  }

  if (!connectionCache.promise) {
    const uri = getMongoUri();
    if (!uri) {
      throw new Error(
        "LUCKY_SATTA_MONGODB_URI (or MONGODB_URI) is not configured",
      );
    }

    // Match Lucky Satta's connection setup. This avoids Windows/local resolver
    // failures for the Atlas SRV record without affecting any data source.
    if (uri.startsWith("mongodb+srv://")) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    }

    const connection = mongoose.createConnection(uri, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 15_000,
    });

    connectionCache.promise = connection.asPromise().catch((error) => {
      connectionCache.promise = null;
      throw error;
    });
  }

  connectionCache.connection = await connectionCache.promise;
  return connectionCache.connection;
}

function getISTDate(date: Date, dayOffset = 0): string {
  const shifted = new Date(date.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(shifted);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function cleanResult(value: unknown): string {
  const result = String(value ?? "").trim();
  return /^\d{1,3}$/.test(result) ? result : "";
}

function mapDailyResults(
  documents: LuckySattaResultDocument[],
  today: string,
  yesterday: string,
): LuckySattaDailyResult[] {
  const values = new Map<string, string>();
  for (const document of documents) {
    const game = String(document.game ?? "").toLowerCase();
    const date = String(document.date ?? "");
    const result = cleanResult(document.resultNumber);
    const key = `${game}:${date}`;
    if (result && !values.has(key)) values.set(key, result);
  }

  return Object.entries(LUCKY_SATTA_GAME_NAMES).map(
    ([gameKey, gameName]) => ({
      gameKey,
      gameName,
      today: values.get(`${gameKey}:${today}`) ?? "",
      yesterday: values.get(`${gameKey}:${yesterday}`) ?? "",
    }),
  );
}

async function getResultsFromPublicApi(
  today: string,
  yesterday: string,
): Promise<LuckySattaDailyResult[]> {
  const apiUrl = (
    process.env.LUCKY_SATTA_RESULTS_API_URL ||
    "https://www.lucky-satta.co/api/results"
  ).replace(/\/$/, "");
  const [todayResponse, yesterdayResponse] = await Promise.all([
    fetch(`${apiUrl}?type=today`, { next: { revalidate: 30 } }),
    fetch(`${apiUrl}?type=yesterday`, { next: { revalidate: 30 } }),
  ]);

  if (!todayResponse.ok || !yesterdayResponse.ok) {
    throw new Error(
      `Lucky Satta API returned ${todayResponse.status}/${yesterdayResponse.status}`,
    );
  }

  const [todayDocuments, yesterdayDocuments] = (await Promise.all([
    todayResponse.json(),
    yesterdayResponse.json(),
  ])) as [LuckySattaResultDocument[], LuckySattaResultDocument[]];

  return mapDailyResults(
    [...todayDocuments, ...yesterdayDocuments],
    today,
    yesterday,
  );
}

// Result reads alone use Lucky Satta's MongoDB. All other site data continues
// to use the existing Firebase and scraper sources.
export async function getLuckySattaDailyResults(
  now = new Date(),
): Promise<LuckySattaDailyResult[] | null> {
  const today = getISTDate(now);
  const yesterday = getISTDate(now, -1);

  try {
    const connection = await getConnection();
    const database = connection.db;
    if (!database) throw new Error("Lucky Satta MongoDB connection has no database");
    const documents = await database
      .collection<LuckySattaResultDocument>("results")
      .find({
        date: { $in: [today, yesterday] },
        game: { $in: Object.keys(LUCKY_SATTA_GAME_NAMES) },
      })
      .sort({ updatedAt: -1 })
      .toArray();

    return mapDailyResults(documents, today, yesterday);
  } catch (error) {
    console.warn(
      "[lucky-satta-results] Direct database read unavailable; using API:",
      error instanceof Error ? error.message : error,
    );
  }

  try {
    return await getResultsFromPublicApi(today, yesterday);
  } catch (error) {
    console.error(
      "[lucky-satta-results] Failed to read shared results API:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

const ARCHIVE_GAME_ALIASES: Record<string, string> = {
  desawar: "disawer",
  ghaziabad: "gaziyabad",
};

const getCachedLuckySattaYearlyResults = unstable_cache(
  async (
    gameCode: string,
    year: number,
  ): Promise<LuckySattaArchiveRecord[][]> => {
    const connection = await getConnection();
    const database = connection.db;
    if (!database) {
      throw new Error("Lucky Satta MongoDB connection has no database");
    }

    const mongoGameCode = ARCHIVE_GAME_ALIASES[gameCode] ?? gameCode;
    const documents = await database
      .collection<LuckySattaResultDocument>("results")
      .find(
        {
          game: mongoGameCode,
          date: {
            $gte: `${year}-01-01`,
            $lte: `${year}-12-31`,
          },
        },
        { projection: { date: 1, resultNumber: 1, updatedAt: 1 } },
      )
      .sort({ date: 1, updatedAt: 1 })
      .toArray();

    const months: LuckySattaArchiveRecord[][] = Array.from(
      { length: 12 },
      () => [],
    );
    const recordsByDate = new Map<string, LuckySattaArchiveRecord>();

    for (const document of documents) {
      const date = String(document.date ?? "");
      const result = cleanResult(document.resultNumber);
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && result) {
        recordsByDate.set(date, { date, result });
      }
    }

    for (const record of recordsByDate.values()) {
      const monthIndex = Number(record.date.slice(5, 7)) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        months[monthIndex].push(record);
      }
    }

    return months;
  },
  ["lucky-satta-yearly-results"],
  { revalidate: 86_400, tags: ["lucky-satta-yearly-results"] },
);

export async function getLuckySattaYearlyResults(
  gameCode: string,
  year: number,
): Promise<LuckySattaArchiveRecord[][]> {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return Array.from({ length: 12 }, () => []);
  }

  try {
    return await getCachedLuckySattaYearlyResults(gameCode, year);
  } catch (error) {
    console.error(
      "[lucky-satta-results] Failed to read yearly results from MongoDB:",
      error instanceof Error ? error.message : error,
    );
    return Array.from({ length: 12 }, () => []);
  }
}
