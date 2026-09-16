import mongoose, { type Connection } from "mongoose";
import dns from "node:dns";

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

// Result reads alone use Lucky Satta's MongoDB. All other site data continues
// to use the existing Firebase and scraper sources.
export async function getLuckySattaDailyResults(
  now = new Date(),
): Promise<LuckySattaDailyResult[] | null> {
  try {
    const connection = await getConnection();
    const database = connection.db;
    if (!database) throw new Error("Lucky Satta MongoDB connection has no database");
    const today = getISTDate(now);
    const yesterday = getISTDate(now, -1);
    const documents = await database
      .collection<LuckySattaResultDocument>("results")
      .find({
        date: { $in: [today, yesterday] },
        game: { $in: Object.keys(LUCKY_SATTA_GAME_NAMES) },
      })
      .sort({ updatedAt: -1 })
      .toArray();

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
  } catch (error) {
    console.error(
      "[lucky-satta-results] Failed to read shared results:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
