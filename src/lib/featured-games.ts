// The headline markets promoted in the hero and served as `/<slug>-result`
// landing pages. Data for every game comes from satta29.com, so each game maps
// to the exact column header used on that site (`satta29Name`).
export interface FeaturedGame {
  slug: string; // URL segment → /<slug>-result
  name: string; // display name
  satta29Name: string; // exact column header on satta29.com (chart + homepage)
  time: string; // declared time (IST)
  blurb: string; // one-line SEO intro
}

export const FEATURED_GAMES: FeaturedGame[] = [
  {
    slug: "faridabad-day",
    name: "FARIDABAD DAY",
    satta29Name: "FARIDABAD DAY",
    time: "02:00 PM",
    blurb:
      "Faridabad Day Satta King result declares in the afternoon at 02:00 PM. Check today's Faridabad Day result and the complete record chart below.",
  },
  {
    slug: "delhi-bazar",
    name: "DELHI BAZAR",
    satta29Name: "Delhi Bazar",
    time: "03:05 PM",
    blurb:
      "Delhi Bazar Satta King result declares in the afternoon at 03:05 PM. See today's Delhi Bazar result and historical charts below.",
  },
  {
    slug: "shri-ganesh",
    name: "SHREE GANESH",
    satta29Name: "Shree Ganesh",
    time: "04:40 PM",
    blurb:
      "Shree Ganesh Satta King result is declared at 04:40 PM. Check today's Shree Ganesh result along with the full record chart.",
  },
  {
    slug: "faridabad",
    name: "FARIDABAD",
    satta29Name: "FARIDABAD",
    time: "06:10 PM",
    blurb:
      "Faridabad Satta King result declares every evening at 06:10 PM. Check today's Faridabad result and complete record chart below.",
  },
  {
    slug: "old-alwar",
    name: "OLD ALWAR",
    satta29Name: "OLD ALWAR",
    time: "07:10 PM",
    blurb:
      "Old Alwar Satta King result is declared in the evening at 07:10 PM. Check today's Old Alwar result and the full record chart below.",
  },
  {
    slug: "ghaziabad",
    name: "GHAZIABAD",
    satta29Name: "GHAZIABAD",
    time: "09:10 PM",
    blurb:
      "Ghaziabad Satta King result comes out around 09:10 PM daily. Find today's Ghaziabad result with the full monthly and yearly chart.",
  },
  {
    slug: "dehradun-city",
    name: "DEHRADUN CITY",
    satta29Name: "DEHRADUN CITY",
    time: "10:05 PM",
    blurb:
      "Dehradun City Satta King result is declared late evening at 10:05 PM. Get today's Dehradun City result and old records here.",
  },
  {
    slug: "gali",
    name: "GALI",
    satta29Name: "GALI",
    time: "11:40 PM",
    blurb:
      "Gali Satta King is one of the most played markets, declared late night at 11:40 PM. Get today's Gali result and old records here.",
  },
  {
    slug: "desawer",
    name: "DISAWAR",
    satta29Name: "DESAWER",
    time: "05:15 AM",
    blurb:
      "Disawar (Desawar) Satta King result opens early morning at 05:15 AM. Track today's Disawar result and its complete record chart.",
  },
];

export function getFeaturedGame(slug: string): FeaturedGame | undefined {
  return FEATURED_GAMES.find((g) => g.slug === slug);
}
