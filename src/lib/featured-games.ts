import type { ChartRow } from "./types";

// The six headline markets promoted in the hero. Each maps to one column of the
// combined monthly chart (ChartRow), so we can build both the yearly record grid
// and the latest result for a game from the same data source.
export interface FeaturedGame {
  slug: string; // URL segment + /api/game-chart slug
  name: string; // display name
  chartKey: keyof Omit<ChartRow, "date">; // column in the combined monthly chart
  time: string; // declared time (IST)
  blurb: string; // one-line SEO intro
}

export const FEATURED_GAMES: FeaturedGame[] = [
  {
    slug: "faridabad",
    name: "FARIDABAD",
    chartKey: "frbd",
    time: "06:00 PM",
    blurb:
      "Faridabad Satta King result declares every evening at 06:00 PM. Check today's Faridabad result and complete record chart below.",
  },
  {
    slug: "ghaziabad",
    name: "GHAZIABAD",
    chartKey: "gzbd",
    time: "09:25 PM",
    blurb:
      "Ghaziabad Satta King result comes out around 09:25 PM daily. Find today's Ghaziabad result with the full monthly and yearly chart.",
  },
  {
    slug: "gali",
    name: "GALI",
    chartKey: "gali",
    time: "11:25 PM",
    blurb:
      "Gali Satta King is one of the most played markets, declared late night at 11:25 PM. Get today's Gali result and old records here.",
  },
  {
    slug: "desawar",
    name: "DISAWAR",
    chartKey: "dswr",
    time: "05:00 AM",
    blurb:
      "Disawar (Desawar) Satta King result opens early morning at 05:00 AM. Track today's Disawar result and its complete yearly chart.",
  },
  {
    slug: "shri-ganesh",
    name: "SHREE GANESH",
    chartKey: "srgn",
    time: "04:30 PM",
    blurb:
      "Shree Ganesh Satta King result is declared at 04:30 PM. Check today's Shree Ganesh result along with full record charts.",
  },
  {
    slug: "delhi-bazar",
    name: "DELHI BAZAR",
    chartKey: "dlbz",
    time: "03:00 PM",
    blurb:
      "Delhi Bazar Satta King result declares in the afternoon at 03:00 PM. See today's Delhi Bazar result and historical charts below.",
  },
];

export function getFeaturedGame(slug: string): FeaturedGame | undefined {
  return FEATURED_GAMES.find((g) => g.slug === slug);
}
