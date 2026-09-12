import type { ChartRow } from "@/lib/types";

export const HISTORICAL_START_YEAR = 2015;
export const HISTORICAL_END_YEAR = 2026;

export interface ArchiveGame {
  slug: string;
  name: string;
  chartKey: keyof Omit<ChartRow, "date">;
}

export const ARCHIVE_GAMES: ArchiveGame[] = [
  { slug: "delhi-bazar", name: "Delhi Bazar", chartKey: "dlbz" },
  { slug: "shri-ganesh", name: "Shri Ganesh", chartKey: "srgn" },
  { slug: "faridabad", name: "Faridabad", chartKey: "frbd" },
  { slug: "ghaziabad", name: "Ghaziabad", chartKey: "gzbd" },
  { slug: "gali", name: "Gali", chartKey: "gali" },
  { slug: "desawar", name: "Desawar", chartKey: "dswr" },
];

export const ARCHIVE_YEARS = Array.from(
  { length: HISTORICAL_END_YEAR - HISTORICAL_START_YEAR + 1 },
  (_, index) => HISTORICAL_END_YEAR - index
);

export function getArchiveGame(slug: string): ArchiveGame | undefined {
  return ARCHIVE_GAMES.find((game) => game.slug === slug);
}

export function getArchivePath(gameSlug: string, year: number): string {
  return `/${gameSlug}-yearly-chart-${year}`;
}

export function parseArchiveSlug(
  slug: string
): { game: ArchiveGame; year: number } | null {
  const match = slug.match(/^(.+)-yearly-chart-(\d{4})$/);
  if (!match) return null;

  const year = Number(match[2]);
  const game = getArchiveGame(match[1]);
  if (
    !game ||
    year < HISTORICAL_START_YEAR ||
    year > HISTORICAL_END_YEAR
  ) {
    return null;
  }

  return { game, year };
}
