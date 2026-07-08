// ─── Shared Types ───

export interface GameResult {
  name: string;
  time: string;
  yesterday: string;
  today: string;
}

export interface ChartRow {
  date: string;
  dswr: string;
  frbd: string;
  gzbd: string;
  gali: string;
  srgn: string;
  dlbz: string;
}

export interface MonthlyChartData {
  month: string;
  year: string;
  results: ChartRow[];
  scrapedAt: number;
}

export interface HomepageData {
  live: GameResult[];
  next: GameResult[];
  rest: GameResult[];
  scrapedAt: number;
}

// Data scraped from resultsatta.com — the homepage "first section" results board.
export interface ResultSattaData {
  games: GameResult[];
  scrapedAt: number;
}

export interface GameChartData {
  gameName: string;
  chartTitle: string;
  month: string;
  year: string;
  columns: string[];
  results: { date: string; day: string; result: string }[];
  scrapedAt: number;
}

export interface SK24Game {
  name: string;
  time: string;
  yesterday: string;
  today: string;
}

export interface SK24Spotlight {
  upcomingName: string;
  declaredName: string;
  declaredResult: string;
}

export interface SK24GamesData {
  games: SK24Game[];
  spotlight?: SK24Spotlight;
  scrapedAt: number;
}

export interface SK24ChartTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface SK24ChartsData {
  tables: SK24ChartTable[];
  scrapedAt: number;
}
