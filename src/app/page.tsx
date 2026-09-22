import { Fragment } from "react";
import { AdSlot } from "@/components/layout/AdSlot";
import Link from "next/link";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { WhatsAppChannelBanner } from "@/components/layout/WhatsAppChannelBanner";
import { MonthlyChartSection } from "@/components/home/MonthlyChartSection";
import { KhaiwalCard } from "@/components/home/KhaiwalCard";
import { ScrollAnimator } from "@/components/home/ScrollAnimator";
import {
  FiZap,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiCalendar,
} from "react-icons/fi";
import {
  getResultSattaData,
  getSatta29Chart,
  getSharedHomepageData,
} from "@/lib/api-helpers";
import {
  isResultDisplayable,
  parseClockTime,
  getISTMinutesOfDay,
  getISTDateParts,
  normalizeResultDays,
} from "@/lib/utils";
import { FEATURED_GAMES } from "@/lib/featured-games";
import type { GameResult } from "@/lib/types";
import { PreviousYearCharts } from "@/components/home/PreviousYearCharts";
import {
  getDailyResultOverridesFromFirestore,
  type DailyResultOverride,
} from "@/lib/firebase-cache";
import {
  getLuckySattaDailyResults,
  type LuckySattaDailyResult,
} from "@/lib/lucky-satta-results";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

// Server-render the page and revalidate at most once every 30s. The results board
// + charts are cached at the edge, so a traffic spike triggers at most one
// regeneration per window — no per-request scraping, no client fetch waterfall.
export const revalidate = 30;

// ─── Main Page (Server Component) ───

// Normalize a game name for cross-source matching (whitespace + known spelling
// variants between the scraped feeds).
function normalizeGameName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&(?:#x20|#32|nbsp);/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .replace("desawer", "desawar")
    .replace("disawer", "desawar")
    .replace("disawar", "desawar")
    .replace("shreeganesh", "shriganesh");
}

const HIDDEN_GAME_NAMES = new Set(
  [
    "Ujala Super",
    "Chandni Chowk Matka",
    "VIP Agra",
    "DS Number 1",
    "Jind Gali",
    "Africa Disawar",
    "Star Gali",
    "Shree Kalka",
    "Gali Gold",
    "Maa Lakshmi Delhi",
    "Shivraj 786",
    "Punjab Laxmi",
    "Delhi Matka Kings",
    "Fateabad",
  ].map(normalizeGameName),
);

const HOME_FAQS: Array<[string, string]> = [
  [
    "Where can I check today's Satta King results?",
    "Use the homepage result board or open a dedicated market page to see the latest available update and its scheduled time.",
  ],
  [
    "Where can I check the Gali result?",
    "Open the dedicated Gali result page for the latest available value, expected time and current-year chart.",
  ],
  [
    "Are Desawar and Disawar the same market name?",
    "Disawar is a common alternate spelling used for Desawar. The site connects both spellings to the same market information.",
  ],
  [
    "Where can I browse old result charts?",
    "The Charts section contains monthly tables and links to game-specific yearly archives.",
  ],
  [
    "Can historical charts predict a future result?",
    "No. Historical charts document past records only and cannot guarantee or predict a future result.",
  ],
  [
    "Why can a result appear after its scheduled time?",
    "The listed time is the usual publication time. Source announcements can be delayed, so a market remains pending until a value is available.",
  ],
];

function isVisibleGame(game: GameResult): boolean {
  const name = normalizeGameName(game.name);
  return !HIDDEN_GAME_NAMES.has(name) && !name.includes("showyourgamehere");
}

// Merge the scraped homepage results (live/next/rest) onto the first-section
// games, filling in each game's declared today/yesterday value and time.
function mergeHomepageResults(
  games: GameResult[],
  homepageGames: GameResult[],
): GameResult[] {
  const homepageMap = new Map(
    homepageGames.map((g) => [normalizeGameName(g.name), g]),
  );
  return games.map((g) => {
    const hp = homepageMap.get(normalizeGameName(g.name));
    if (!hp) return g;
    return {
      ...g,
      today: hp.today ?? g.today,
      yesterday: hp.yesterday ?? g.yesterday,
      time: hp.time || g.time,
    };
  });
}

function mergeAdminOverrides(
  games: GameResult[],
  overrides: DailyResultOverride[],
): GameResult[] {
  const overrideMap = new Map<string, DailyResultOverride>();
  for (const override of overrides) {
    overrideMap.set(normalizeGameName(override.gameCode), override);
    overrideMap.set(normalizeGameName(override.gameName), override);
  }

  return games.map((game) => {
    const override = overrideMap.get(normalizeGameName(game.name));
    return override ? { ...game, today: override.result } : game;
  });
}

function mergeLuckySattaResults(
  games: GameResult[],
  results: LuckySattaDailyResult[] | null,
): GameResult[] {
  if (!results) return games;

  const resultMap = new Map(
    results.map((result) => [normalizeGameName(result.gameName), result]),
  );

  return games.map((game) => {
    const result = resultMap.get(normalizeGameName(game.name));
    return result
      ? { ...game, today: result.today, yesterday: result.yesterday }
      : game;
  });
}

export default async function HomePage() {
  const now = new Date();
  const month = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "long",
  })
    .format(now)
    .toLowerCase();
  const year = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
  }).format(now);
  const todayParts = getISTDateParts(now);
  const today = `${todayParts.year}-${String(todayParts.month + 1).padStart(2, "0")}-${String(todayParts.day).padStart(2, "0")}`;

  // Fetch everything on the server, directly from the data layer (no self-HTTP).
  const [resultSatta, homepage, chart, adminOverrides, luckySattaResults] =
    await Promise.all([
    getResultSattaData(),
    getSharedHomepageData(),
    getSatta29Chart(month, year),
    getDailyResultOverridesFromFirestore(today),
    getLuckySattaDailyResults(now),
  ]);

  const games = (resultSatta?.games ?? []).filter(isVisibleGame);
  const chartData = chart
    ? {
        month: chart.month,
        year: chart.year,
        games: chart.games,
        rows: chart.rows,
      }
    : { month: "", year: "", games: [] as string[], rows: [] };

  // Don't repeat first-section games in LIVE/NEXT/REST — dedupe by normalized name.
  const firstSectionNames = new Set(
    games.map((g) => normalizeGameName(g.name)),
  );
  const notInFirst = (g: GameResult) =>
    isVisibleGame(g) && !firstSectionNames.has(normalizeGameName(g.name));
  const liveResults = (homepage?.live ?? []).filter(notInFirst);
  const nextResults = (homepage?.next ?? []).filter(notInFirst);
  const restResults = (homepage?.rest ?? []).filter(notInFirst);

  // Clear potentially stale, undated scraper values first. Date-stamped admin
  // and Lucky Satta values are merged afterwards so a genuine result published
  // after midnight (notably Gali) is not erased by the rollover cleanup.
  const normalizedScrapedGames = normalizeResultDays(
    mergeHomepageResults(games, [
      ...liveResults,
      ...nextResults,
      ...restResults,
    ]),
    now,
  );
  const mergedGames = mergeLuckySattaResults(
    mergeAdminOverrides(normalizedScrapedGames, adminOverrides),
    luckySattaResults,
  );

  // Scoreboard spotlight — latest declared result + the next awaited game.
  const nowMin = getISTMinutesOfDay(now);
  const timed = mergedGames
    .map((g) => ({ g, min: parseClockTime(g.time) }))
    .filter((x): x is { g: GameResult; min: number } => x.min !== null);

  // Next game is driven by its scheduled IST time. Measure forward around a
  // full day so the schedule rolls from Gali at night to Disawar in the morning.
  const minutesUntil = (min: number) => (min - nowMin + 1440) % 1440;
  const latestToday =
    mergedGames
      .filter((game) => isResultDisplayable(game.time, game.today, now))
      .sort(
        (a, b) => (parseClockTime(b.time) ?? 0) - (parseClockTime(a.time) ?? 0),
      )[0] ?? null;
  // Before today's first declaration, keep the spotlight useful by showing the
  // last result from the completed day. Sorting by the scheduled clock time
  // makes the late-night Gali result the fallback instead of an empty state.
  const latestPrevious =
    mergedGames
      .filter((game) => Boolean(game.yesterday))
      .sort(
        (a, b) => (parseClockTime(b.time) ?? 0) - (parseClockTime(a.time) ?? 0),
      )[0] ?? null;
  const latest = latestToday
    ? { game: latestToday, value: latestToday.today, isPrevious: false }
    : latestPrevious
      ? {
          game: latestPrevious,
          value: latestPrevious.yesterday,
          isPrevious: true,
        }
      : null;
  const upNext =
    timed.sort((a, b) => minutesUntil(a.min) - minutesUntil(b.min))[0]?.g ??
    null;
  const declaredCount = mergedGames.filter(
    (game) => isResultDisplayable(game.time, game.today, now),
  ).length;

  const updatedAt =
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now) + " IST";
  const monthYear = `${month.charAt(0).toUpperCase() + month.slice(1)}-${year}`;

  const schedule =
    games.length > 0 ? games.map((g) => ({ name: g.name, time: g.time })) : [];
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: `Satta King Result Today ${year}`,
        description:
          "Latest available game-wise results, scheduled times and historical chart records.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        dateModified: today,
        inLanguage: "en-IN",
      },
      {
        "@type": "FAQPage",
        mainEntity: HOME_FAQS.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <ScrollAnimator>
      <JsonLd data={homeJsonLd} />
      {/* Hero */}
      <div
        id="top"
        className="bg-white text-[#3a1d00] text-center py-5 md:py-8 px-3 md:px-4 border-b-4 border-[#e0850b]"
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
          Satta King Result Today {year} &ndash; Fast &amp; Latest Satta Result
          Updates
        </h1>

        {/* Scoreboard spotlight — distinct hero band */}
        <Scoreboard
          latest={latest}
          upNext={upNext}
          total={games.length}
          declared={declaredCount}
        />
      </div>

      {/* Disclaimer */}
      <div className="bg-red-600 border-b border-red-800 py-1.5 md:py-2 px-2 md:px-4">
        <p className="text-center text-[12px] sm:text-[10px] md:text-xs text-white max-w-4xl mx-auto leading-relaxed">
          <span className="font-bold text-white">DISCLAIMER:</span>{" "}
          SattaKing-Gali.com is an independent informational website. We do not
          promote gambling or betting.{" "}
          <Link
            href="/disclaimer"
            className="text-white underline hover:no-underline font-medium"
          >
            Read Full Disclaimer
          </Link>
        </p>
      </div>

      {/* Last Updated — sits below the disclaimer */}
      <div className="bg-white text-center py-2.5 md:py-3 px-3">
        <div className="inline-flex items-center gap-1.5 md:gap-2 text-[14px] md:text-xs text-black font-semibold">
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#a5370c] rounded-full animate-live-pulse" />
          Last Updated: {updatedAt}
        </div>
      </div>
      {/* Featured market quick-links */}
      <div className=" py-5 md:py-3 px-3">
        <FeaturedGameLinks />
      </div>

      <div className="max-w-[1400px] mx-auto px-2 sm:px-3 md:px-6 py-4 md:py-6 space-y-6 md:space-y-8">
        <AdSlot placement="homepage_top" />

        {/* FIRST SECTION — Results board scraped from resultsatta.com */}
        <ResultBoard games={mergedGames} now={now} />

        {/* Single inline WhatsApp CTA between results and contact details */}
        <WhatsAppButton />

        {/* Khaiwal / Game Schedule & Contact — directly under the first section */}
        <KhaiwalCard games={schedule} />

        {/* Keyword buttons — SEO */}
        <KeywordButtons monthYear={monthYear} />

        <WhatsAppChannelBanner />

        {/* Monthly Chart — shown above the LIVE/NEXT/REST sections */}
        {chartData.rows.length > 0 && (
          <MonthlyChartSection
            month={chartData.month}
            year={chartData.year}
            games={chartData.games}
            rows={chartData.rows}
          />
        )}

        {/* LIVE / Upcoming / Declared — one shared table header, grouped rows */}
        {(liveResults.length > 0 ||
          nextResults.length > 0 ||
          restResults.length > 0) && (
          <CombinedResults
            groups={[
              {
                title: "LIVE",
                subtitle: "Games currently being declared",
                barColor: "#dc2626",
                games: liveResults,
                isLive: true,
                icon: <FiZap className="w-5 h-5" />,
              },
              {
                title: "Upcoming",
                subtitle: "These games will be declared soon",
                barColor: "#ea580c",
                games: nextResults,
                icon: <FiClock className="w-5 h-5" />,
              },
              {
                title: "Declared",
                subtitle: "Today's completed game results",
                barColor: "#059669",
                games: restResults,
                icon: <FiAward className="w-5 h-5" />,
              },
            ]}
          />
        )}

        <AdSlot placement="homepage_middle" />

        <AdSlot placement="homepage_bottom" />

        {/* SEO Content */}
        <PreviousYearCharts />

        <SeoContent />
      </div>
    </ScrollAnimator>
  );
}

// ─── Featured market quick-links (hero) ───

function FeaturedGameLinks() {
  const year = new Date().getFullYear();
  return (
    <div className="mt-4 md:mt-5 max-w-3xl mx-auto grid grid-cols-3 gap-2 md:gap-3">
      {FEATURED_GAMES.map((g) => (
        <Link
          key={g.slug}
          href={`/${g.slug}-result`}
          className="text-center bg-[#FDF3C9] hover:bg-[#FCE684] text-[#a5370c] font-extrabold text-[11px] sm:text-xs md:text-sm py-2 md:py-2.5 px-1 rounded-lg border border-[#e0850b] shadow-sm hover:shadow-md transition-all leading-tight"
        >
          <span className="block">{g.name}</span>
          <span className="block text-[9px] sm:text-[10px] md:text-xs font-bold text-[#c2600f]">
            Results {year}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ─── Scoreboard spotlight (distinctive hero band) ───

function Scoreboard({
  latest,
  upNext,
  total,
  declared,
}: {
  latest: {
    game: GameResult;
    value: string;
    isPrevious: boolean;
  } | null;
  upNext: GameResult | null;
  total: number;
  declared: number;
}) {
  return (
    <div className="bg-[#FDF3C9]">
      <div className="max-w-[1400px] mx-auto px-2 sm:px-3 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Next upcoming — dark, with pulsing WAIT badge */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#241a06] to-[#6b4c12] p-5 md:p-6 border-2 border-[#e0a92b] overflow-hidden shadow-xl shadow-black/20">
            <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-[#f5b301]/15 blur-2xl" />

            <div className="relative flex items-center gap-2 text-[#FFD93B] text-[11px] md:text-xs font-extrabold uppercase tracking-[0.2em]">
              <FiClock className="w-4 h-4" /> Next Game
            </div>

            {upNext ? (
              <div className="relative mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-extrabold text-2xl md:text-4xl uppercase truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                    {upNext.name}
                  </p>
                  <p className="text-[#FCE38A] text-xs md:text-sm font-semibold mt-1">
                    Result expected at {upNext.time}
                  </p>
                </div>
                <div
                  title="Result awaited"
                  aria-label="Result awaited"
                  className="shrink-0 inline-flex flex-col items-center justify-center gap-1 bg-[#dc2626] text-white rounded-full w-16 h-16 md:w-20 md:h-20 shadow-lg shadow-[#dc2626]/40 border-2 border-white/70 animate-wait-pulse"
                >
                  <FiClock className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-[10px] md:text-xs font-extrabold tracking-widest">
                    WAIT
                  </span>
                </div>
              </div>
            ) : (
              <p className="relative mt-4 text-[#FCE38A] font-semibold text-base md:text-lg">
                All of today&apos;s games are declared.
              </p>
            )}
          </div>
          {/* Latest declared — dramatic dark reveal */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#2a1400] via-[#5a2408] to-[#a5370c] p-5 md:p-6 border-2 border-[#FFD93B] overflow-hidden shadow-xl shadow-[#a5370c]/30">
            {/* glow blobs */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#FFD93B]/20 blur-2xl" />
            <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-[#dc2626]/20 blur-2xl" />

            <div className="relative flex items-center gap-2 text-[#FFD93B] text-[11px] md:text-xs font-extrabold uppercase tracking-[0.2em]">
              <FiAward className="w-4 h-4" /> Latest Result
              <span className="ml-auto inline-flex items-center gap-1.5 bg-[#16a34a] text-white text-[9px] md:text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" />
                DECLARED
              </span>
            </div>

            {latest ? (
              <div className="relative mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-extrabold text-2xl md:text-4xl uppercase truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                    {latest.game.name}
                  </p>
                  <p className="text-[#FCE38A] text-xs md:text-sm font-semibold mt-1">
                    {latest.isPrevious && "Previous result · "}
                    {latest.game.time}
                  </p>
                </div>
                <div className="shrink-0 bg-white text-[#dc2626] font-extrabold font-mono text-5xl md:text-7xl rounded-2xl px-5 md:px-7 py-1.5 md:py-2 animate-result-glow leading-none">
                  {latest.value}
                </div>
              </div>
            ) : (
              <p className="relative mt-4 text-[#FCE38A] font-semibold text-base md:text-lg">
                Waiting for today&apos;s first result…
              </p>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-3 md:mt-4 grid grid-cols-3 gap-2 md:gap-3">
          <StatPill icon={<FiCalendar />} label="Games" value={String(total)} />
          <StatPill
            icon={<FiTrendingUp />}
            label="Declared"
            value={String(declared)}
          />
          <StatPill
            icon={<FiZap />}
            label="Pending"
            value={String(Math.max(0, total - declared))}
            live
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  live,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  live?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-2 bg-white/70 border border-[#f0d98a] rounded-xl py-2 md:py-2.5">
      <span className="text-[#d97706]">{icon}</span>
      <span className="text-[#3a1d00] font-extrabold text-base md:text-xl">
        {value}
      </span>
      <span className="text-[#8a6d2f] text-[10px] md:text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
        {label}
        {live && (
          <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full animate-live-pulse" />
        )}
      </span>
    </div>
  );
}

// ─── Shared results table ───
// A custom-styled table (gold header, per-row accent rail, time chip, watch
// icon for pending results). Intentionally its own look — not modelled on any
// other satta site's table.

function GameTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-[#FFD93B] to-[#F5A623] text-[#a5370c] text-[11px] md:text-sm uppercase tracking-wide">
            <th className="text-left py-2.5 px-3 md:px-4 font-extrabold border-b-2 border-[#e0850b]">
              Game
            </th>
            <th className="py-2.5 px-2 font-extrabold border-b-2 border-[#e0850b] text-center w-[24%] md:w-[22%]">
              Yesterday
            </th>
            <th className="py-2.5 px-2 md:px-3 font-extrabold border-b-2 border-[#e0850b] text-center w-[26%] md:w-[24%]">
              Today
            </th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function GameRow({
  game,
  today,
  showWatch,
  live,
  i,
}: {
  game: GameResult;
  // The declared value to display, or null when it isn't out yet.
  today: string | null;
  // When there's no value: show the "watch / awaiting" icon vs a plain dash.
  showWatch: boolean;
  live?: boolean;
  i: number;
}) {
  const slug = game.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <tr
      className={`border-b border-[#f0e2a6] transition-colors hover:bg-[#fdf2c9] ${
        i % 2 === 0 ? "bg-[#FFFDF3]" : "bg-[#FFF7DA]"
      }`}
    >
      {/* Game name + time chip + record chart link */}
      <td className="py-2.5 px-3 md:px-4 border-l-[5px] border-[#F5A623]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#1e293b] uppercase text-[15px] md:text-lg leading-tight break-words">
            {game.name}
          </span>
          {live && (
            <span className="w-2 h-2 bg-[#dc2626] rounded-full animate-live-pulse shrink-0" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1">
          <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-[#8a6d2f]">
            <FiClock className="w-3 h-3" /> {game.time}
          </span>
          <Link
            href={`/chart/${slug}`}
            className="text-[10px] md:text-xs font-semibold text-[#a5370c] hover:text-[#d97706]"
          >
            Record Chart &rarr;
          </Link>
        </div>
      </td>

      {/* Yesterday */}
      <td className="py-2.5 px-2 text-center">
        <span className="font-mono font-extrabold text-xl md:text-3xl text-[#1e293b]">
          {game.yesterday || "--"}
        </span>
      </td>

      {/* Today */}
      <td className="py-2.5 px-2 md:px-3 text-center">
        {today ? (
          <span className="inline-block bg-[#F6D68A] border border-[#E7B85C] rounded-lg px-2.5 py-0.5 font-mono font-extrabold text-xl md:text-3xl text-[#dc2626]">
            {today}
          </span>
        ) : showWatch ? (
          <span
            title="Result awaited"
            aria-label="Result awaited"
            className="inline-flex text-[#a5370c]"
          >
            <FiClock className="w-6 h-6 md:w-7 md:h-7 animate-watch-tick" />
          </span>
        ) : (
          <span className="font-mono font-bold text-xl text-[#c9a94e]">--</span>
        )}
      </td>
    </tr>
  );
}

// ─── First Section: ResultSatta Results Board ───

function formatResultDateRange(now: Date): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const getParts = (date: Date) => {
    const parts = formatter.formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? "";
    return {
      day: value("day"),
      month: value("month"),
      year: value("year"),
    };
  };
  const today = getParts(now);
  const yesterday = getParts(new Date(now.getTime() - 24 * 60 * 60 * 1000));

  if (today.year !== yesterday.year) {
    return `${yesterday.day} ${yesterday.month} ${yesterday.year} & ${today.day} ${today.month} ${today.year}`;
  }
  if (today.month !== yesterday.month) {
    return `${yesterday.day} ${yesterday.month} & ${today.day} ${today.month} ${today.year}`;
  }
  return `${yesterday.day} & ${today.day} ${today.month} ${today.year}`;
}

function ResultBoard({ games, now }: { games: GameResult[]; now: Date }) {
  // `games` is already merged and normalized for the post-midnight rollover.
  const displayGames = games;

  const resultDateRange = formatResultDateRange(now);

  return (
    <section>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
        {/* Title Bar */}
        <div className="bg-white text-black text-center py-3 px-3 border-b-2 border-[#e0850b]">
          <h2 className="text-base md:text-xl font-extrabold uppercase tracking-wide text-black">
            Satta King Results &ndash; {resultDateRange} | Time-Wise Updates
          </h2>
        </div>

        {/* Boxes grid */}
        {displayGames.length === 0 ? (
          <div className="py-8 text-center text-[#b09a5a] font-medium bg-[#FFFDF3]">
            Loading live results&hellip;
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 md:gap-4 p-3 md:p-4 bg-[#FFFDF3]">
            {displayGames.map((game, i) => {
              // The merged value has already passed source-aware rollover checks.
              const showToday = isResultDisplayable(
                game.time,
                game.today,
                now,
              );
              return (
                <GameCard
                  key={game.name + i}
                  game={game}
                  today={showToday ? game.today : null}
                  showWatch={!showToday}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Result box (card) — used by the first Result Board section ───

function GameCard({
  game,
  today,
  showWatch,
}: {
  game: GameResult;
  today: string | null;
  showWatch: boolean;
}) {
  const slug = game.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="rounded-xl border-2 border-[#f0d98a] bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Game name + time */}
      <div className="bg-gradient-to-r from-[#FFF7DA] to-[#FCE38A] px-3 py-1.5 border-b border-[#f0d98a]">
        <span className="block font-extrabold text-[#1e293b] uppercase text-lg md:text-xl leading-tight break-words">
          {game.name}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-[#8a6d2f]">
          <FiClock className="w-3 h-3" /> {game.time}
        </span>
      </div>

      {/* Yesterday / Today values */}
      <div className="grid grid-cols-2 divide-x divide-[#f0e2a6]">
        <div className="text-center py-2">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-[#8a6d2f]">
            Yesterday
          </p>
          <p className="font-mono font-extrabold text-2xl md:text-3xl text-[#1e293b]">
            {game.yesterday || "--"}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-2">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-[#8a6d2f]">
            Today
          </p>
          {today ? (
            <span className="inline-block bg-[#F6D68A] border border-[#E7B85C] rounded-lg px-2.5 py-0.5 font-mono font-extrabold text-2xl md:text-3xl text-[#dc2626]">
              {today}
            </span>
          ) : showWatch ? (
            <span
              title="Result awaited"
              aria-label="Result awaited"
              className="inline-flex text-[#a5370c]"
            >
              <FiClock className="w-6 h-6 md:w-7 md:h-7 animate-watch-tick" />
            </span>
          ) : (
            <span className="font-mono font-bold text-2xl text-[#c9a94e]">
              --
            </span>
          )}
        </div>
      </div>

      {/* Record chart link */}
      <Link
        href={`/chart/${slug}`}
        className="mt-auto block text-center text-[11px] md:text-xs font-semibold text-[#a5370c] hover:text-[#d97706] bg-[#FFFBEA] border-t border-[#f0e2a6] py-1.5"
      >
        Record Chart &rarr;
      </Link>
    </div>
  );
}

// ─── Generic LIVE / NEXT / REST Section (read from shared Firebase) ───

type ResultGroup = {
  title: string;
  subtitle: string;
  barColor: string;
  games: GameResult[];
  isLive?: boolean;
  icon?: React.ReactNode;
};

function CombinedResults({ groups }: { groups: ResultGroup[] }) {
  const visible = groups.filter((g) => g.games.length > 0);

  return (
    <section>
      <div className="bg-white rounded-2xl border-2 border-[#e0850b] overflow-hidden shadow-sm">
        {/* One shared GAME / YESTERDAY / TODAY header; each group is a
            separator row followed by its games. */}
        <GameTable>
          {visible.map((group) => (
            <Fragment key={group.title}>
              {/* Group heading row (spans all columns) */}
              <tr>
                <td colSpan={3} className="p-0">
                  <div className="flex items-center gap-2.5 md:gap-3 bg-gradient-to-r from-[#FFF7DA] to-[#FCE38A] px-3 md:px-4 py-2.5 md:py-3 border-y-2 border-[#e0850b]">
                    <span
                      className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: group.barColor }}
                    >
                      {group.icon}
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <h3
                        className="font-extrabold uppercase tracking-wide text-sm md:text-lg leading-tight"
                        style={{ color: group.barColor }}
                      >
                        {group.title}
                        {group.isLive && (
                          <span className="inline-block w-2 h-2 rounded-full animate-live-pulse ml-1.5 align-middle bg-current" />
                        )}
                      </h3>
                      <p className="text-[11px] md:text-xs font-medium text-[#8a6d2f] leading-tight">
                        {group.subtitle}
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-[11px] md:text-xs font-bold text-white rounded-full px-2.5 py-1 shadow-sm"
                      style={{ backgroundColor: group.barColor }}
                    >
                      {group.games.length}
                    </span>
                  </div>
                </td>
              </tr>
              {group.games.map((game, i) => (
                <GameRow
                  key={group.title + game.name + i}
                  i={i}
                  game={game}
                  today={game.today || null}
                  showWatch={!!group.isLive}
                  live={group.isLive}
                />
              ))}
            </Fragment>
          ))}
        </GameTable>
      </div>
    </section>
  );
}

// ─── Useful internal navigation ───

const QUICK_RESOURCES = [
  { label: "Daily Result Timings", href: "/result-timings" },
  { label: "Monthly Charts", href: "/charts" },
  { label: "Gali Result", href: "/gali-result" },
  { label: "Desawar Result", href: "/desawer-result" },
  { label: "Ghaziabad Result", href: "/ghaziabad-result" },
  { label: "Result Guides", href: "/blog" },
];

function KeywordButtons({ monthYear }: { monthYear: string }) {
  return (
    <section className="space-y-3">
      {/* Top full-width bar */}
      <Link
        href="/charts"
        className="block w-full text-center bg-gradient-to-r from-[#FFD93B] to-[#F5A623] text-[#a5370c] font-bold text-sm md:text-lg py-3 md:py-4 rounded-xl shadow-md border-2 border-[#e0850b] hover:brightness-105 transition-all"
      >
        Click here to view the latest chart for all games for {monthYear}
      </Link>

      {/* Keyword grid — 2 per row */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {QUICK_RESOURCES.map((resource) => (
          <Link
            key={resource.href}
            href={resource.href}
            className="text-center bg-gradient-to-b from-[#FFD93B] to-[#d4a017] text-[#3a1d00] font-extrabold text-xs sm:text-sm md:text-lg py-3.5 md:py-4 rounded-xl border-2 border-[#e0850b] shadow-sm hover:brightness-105 transition-all"
          >
            {resource.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── SEO Content ───

function SeoContent() {
  const resultGames = [
    "Gali Satta King Result Today",
    "Desawar Satta King Result",
    "Disawar Satta Chart 2026",
    "Faridabad Satta King Result",
    "Faridabad Day Result",
    "Ghaziabad Satta Result",
    "Delhi Bazar Result",
    "Shree Ganesh Satta Result",
    "Old Alwar Result",
    "Dehradun City Result",
  ];
  const chartGames = [
    "Gali Chart",
    "Desawar Chart",
    "Faridabad Chart",
    "Ghaziabad Chart",
    "Delhi Bazar Chart",
    "Shree Ganesh Chart",
  ];
  const marketSections: Array<{
    title: string;
    paragraphs: string[];
    items?: string[];
    outro?: string;
  }> = [
    {
      title: "Gali Satta King Result Today & Gali Chart 2026 – Latest Updates",
      paragraphs: [
        "Looking for the latest Gali Satta King Result? You can quickly check the available Gali result updates, previous charts, and record information in one place.",
        "Gali Satta King is one of the most searched Satta markets. If you are checking Gali Result Today, Gali Satta Chart 2026, or previous Gali records, visit the dedicated Gali section for easy access to the latest available information.",
      ],
    },
    {
      title: "Desawar Satta King Result 2026 – Latest Disawar Chart Updates",
      paragraphs: [
        "Want to check the Desawar Result Today? Find the latest available Desawar updates and chart information with a simple and easy-to-use format.",
        "Many people also search Desawar as Disawar, so both names are covered to help you find the correct result page easily.",
      ],
      items: [
        "Desawar Result Today",
        "Disawar Result",
        "Desawar Chart 2026",
        "Previous Desawar Records",
      ],
      outro:
        "All related information is available in the dedicated Desawar section.",
    },
    {
      title: "Faridabad Satta King Result Today & Faridabad Chart 2026",
      paragraphs: [
        "Searching for the Faridabad Satta Result Today? Get quick access to the latest available Faridabad result updates and previous chart information.",
        "The Faridabad section helps you check important details like Faridabad Result, Faridabad Satta Chart 2026, and old records without searching through different pages.",
        "For Faridabad Day results, make sure you select the correct section to view the information you are looking for.",
      ],
    },
    {
      title: "Ghaziabad Satta King Result – Latest Updates & Chart Information",
      paragraphs: [
        "Need the Ghaziabad Satta Result quickly? Here you can find the latest available Ghaziabad result updates along with chart and previous record information.",
        "Whether you are searching for Ghaziabad Result Today, Ghaziabad Satta Chart 2026, or Ghaziabad Record, you can easily access the related information from the dedicated Ghaziabad section.",
        "Different search spellings like Gaziabad Result are also covered to make it easier to find the right page.",
      ],
    },
    {
      title: "Delhi Bazar Satta Result & Chart 2026 – Check Latest Updates",
      paragraphs: [
        "Looking for Delhi Bazar Result Today? Find the latest available Delhi Bazar result updates and chart details in a simple format.",
        "You can check Delhi Bazar related information including previous charts, records, and available updates without any confusion.",
        "The dedicated Delhi Bazar section makes it easier to find the information you need quickly.",
      ],
    },
    {
      title: "Shree Ganesh Satta King Result & Chart Updates",
      paragraphs: [
        "Want to check the Shree Ganesh Satta Result? Get easy access to the latest available updates and previous chart information.",
        "The Shree Ganesh section covers related searches like Shree Ganesh Result, Shri Ganesh Satta King, Shree Ganesh Chart, and previous records.",
        "Everything is arranged in a simple way so you can find the required information easily.",
      ],
    },
    {
      title: "Faridabad Day, Old Alwar & Dehradun City Result Updates",
      paragraphs: [
        "Apart from popular markets, SattaKing-Gali.com also provides separate sections for other games like:",
      ],
      items: [
        "Faridabad Day Result",
        "Old Alwar Result",
        "Dehradun City Result",
      ],
      outro:
        "You can select your preferred game section and check the available result updates and chart information easily.",
    },
    {
      title: "Nagpur Satta King Result – Latest Nagpur Chart Updates",
      paragraphs: [
        "Looking for the Nagpur Satta Result Today? Find the latest available Nagpur result updates and chart information in a simple format.",
        "You can easily check Nagpur Satta related information, previous records, and available updates from the dedicated Nagpur section.",
      ],
    },
    {
      title: "Bangalore Satta King Result – Check Latest Bangalore Updates",
      paragraphs: [
        "Want to check the Bangalore Satta Result quickly? Here you can find the latest available result updates and chart details in one place.",
        "The Bangalore section helps you access related information easily without searching through multiple pages.",
      ],
    },
    {
      title: "Chennai Satta King Result & Chart Updates",
      paragraphs: [
        "Searching for the Chennai Satta Result Today? Get quick access to the latest available Chennai updates and previous chart information.",
        "You can check Chennai Satta related details and available records through the dedicated Chennai section.",
      ],
    },
    {
      title: "Ahmedabad Satta King Result – Latest Chart Information",
      paragraphs: [
        "Need the latest Ahmedabad Satta Result? Find available Ahmedabad result updates and chart details in an easy-to-read format.",
        "The Ahmedabad section provides simple access to current updates and previous information related to this market.",
      ],
    },
    {
      title: "Satta King Result Today – Latest Updates & Chart Information",
      paragraphs: [
        "Looking for the latest Satta King Result? Here you can find result updates from different markets in one place.",
        "Select your preferred game section and check available results, charts, and previous records easily.",
      ],
    },
    {
      title: "Bharat Satta King Result – Latest Updates",
      paragraphs: [
        "Want to check Bharat Satta Result? Find the latest available updates and related chart information through the dedicated Bharat section.",
        "All details are arranged in a simple way so you can quickly find the information you need.",
      ],
    },
    {
      title: "Badshah Satta King Result & Chart Updates",
      paragraphs: [
        "Looking for Badshah Satta Result Today? Check the latest available Badshah result updates and chart information easily.",
        "The dedicated Badshah section helps you find related records and updates without confusion.",
      ],
    },
    {
      title: "Mahakal Satta King Result – Latest Chart Updates",
      paragraphs: [
        "Searching for Mahakal Satta Result? Get access to available Mahakal result updates and previous chart details.",
        "You can easily explore the Mahakal section for related information and latest updates.",
      ],
    },
    {
      title: "Hindustan Satta King Result Today",
      paragraphs: [
        "Want to check the Hindustan Satta Result? Find the latest available information and chart updates in one simple section.",
        "The Hindustan page makes it easier to access related result details quickly.",
      ],
    },
    {
      title: "Nepal Satta King Result – Latest Nepal Chart Updates",
      paragraphs: [
        "Looking for Nepal Satta Result Today? Check the latest available Nepal result updates and previous chart information.",
        "The Nepal section provides easy access to related records and available updates.",
      ],
    },
    {
      title: "Jaisalmer Satta King Result & Chart Updates",
      paragraphs: [
        "Need the latest Jaisalmer Satta Result? Find updated information and chart details through the dedicated Jaisalmer section.",
        "You can quickly check available records and related updates in a simple format.",
      ],
    },
    {
      title: "Shalimar Satta King Result Today",
      paragraphs: [
        "Searching for Shalimar Satta Result? Get easy access to the latest available updates and previous chart information.",
        "The Shalimar section helps you find the required result details quickly.",
      ],
    },
    {
      title: "Mohali Satta King Result – Latest Updates",
      paragraphs: [
        "Want to check the Mohali Satta Result Today? Find the latest available Mohali result updates and chart information in one place.",
        "You can easily browse related records and available updates through the Mohali section.",
      ],
    },
    {
      title: "Anarkali Satta King Result & Chart Information",
      paragraphs: [
        "Looking for Anarkali Satta Result? Check the latest available updates and previous chart details easily.",
        "The Anarkali section provides simple access to related result information.",
      ],
    },
    {
      title: "Ghaziabad Din Satta King Result – Latest Updates",
      paragraphs: [
        "Searching for Ghaziabad Din Result Today? Find the latest available Ghaziabad Din result updates and related chart information.",
        "You can check the dedicated Ghaziabad Din section for quick access to available results.",
      ],
    },
    {
      title: "Shri Nagar Satta King Result Updates",
      paragraphs: [
        "Want to check Shri Nagar Satta Result? Get the latest available updates and chart details from the dedicated Shri Nagar section.",
        "All information is arranged in a simple format for easy checking.",
      ],
    },
    {
      title: "Uttarakhand Satta King Result – Latest Chart Updates",
      paragraphs: [
        "Looking for Uttarakhand Satta Result Today? Find available result updates and previous chart information easily.",
        "The Uttarakhand section helps you access related details quickly.",
      ],
    },
    {
      title: "Neelkanth Satta King Result & Chart Updates",
      paragraphs: [
        "Searching for Neelkanth Satta Result? Check the latest available updates and related chart information in one place.",
        "The dedicated section makes finding result details simple and easy.",
      ],
    },
    {
      title: "Gurgaon Satta King Result Today",
      paragraphs: [
        "Want to check the Gurgaon Satta Result? Find the latest available Gurgaon updates and previous chart details easily.",
        "You can visit the Gurgaon section for quick access to related information.",
      ],
    },
    {
      title: "UP King Satta Result – Latest Updates & Chart",
      paragraphs: [
        "Looking for UP King Satta Result Today? Get access to available UP King result updates and chart information.",
        "The dedicated UP King section helps you find related details quickly.",
      ],
    },
    {
      title: "Burj Khalifa Satta King Result Updates",
      paragraphs: [
        "Searching for Burj Khalifa Satta Result? Check available updates and chart information through the dedicated section.",
        "Find related result details in a simple and easy format.",
      ],
    },
    {
      title: "Matka King Result Today – Latest Updates",
      paragraphs: [
        "Want to check the Matka King Result? Find available result updates and related chart information in one place.",
        "The Matka King section helps you quickly access the information you are looking for.",
      ],
    },
  ];
  const faqs = HOME_FAQS;

  return (
    <article className="bg-white rounded-xl border border-[#f0e2a6] p-4 md:p-8 text-sm md:text-base text-gray-700 leading-relaxed shadow-sm">
      <section className="space-y-3">
        <div className="mb-5 space-y-3 leading-relaxed">
          <p>
            Check the latest available result by market, then open its chart to
            review earlier records. SattaKing-Gali.com organizes Gali, Desawar,
            Faridabad, Ghaziabad, Delhi Bazar and Shree Ganesh information in a
            consistent game-wise format.
          </p>
          <p>
            Each result page identifies the usual publication time, today&apos;s
            status and the previous available value. The chart pages separate
            monthly and yearly records so a missing entry is not confused with a
            declared result.
          </p>
          <p>
            No confusion, no mixed results simply select your preferred game and
            check the latest result information along with previous chart
            records.
          </p>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#a5370c]">
          Game-wise Result Updates in One Place
        </h2>
        <p>
          Finding the correct Satta result at the right time is important. Our
          website organizes every market separately so visitors can quickly
          access the result they are searching for.
        </p>
        <p>You can check different Satta King game results including:</p>
        <ul className="grid gap-2 sm:grid-cols-2 list-disc pl-5">
          {resultGames.map((game) => (
            <li key={game}>{game}</li>
          ))}
        </ul>
        <p>
          Each section is created to make result searching simple, fast, and
          user-friendly.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold text-[#a5370c]">
          Satta King Chart 2026 - Check Previous Results &amp; Records
        </h2>
        <p>
          Want to check old Satta results? The Satta King Chart 2026 section
          helps visitors explore previous records according to different games.
          Instead of searching multiple websites for old results, users can find
          available charts in one place.
        </p>
        <p>
          The record chart includes previous information for popular markets
          like:
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 list-disc pl-5">
          {chartGames.map((game) => (
            <li key={game}>{game}</li>
          ))}
        </ul>
        <p>
          Previous charts are only historical records. They show past
          information and should not be considered a guaranteed way to predict
          future results.
        </p>
      </section>

      {marketSections.slice(0, 7).map((section) => (
        <section key={section.title} className="mt-8 space-y-3">
          <h2 className="text-xl font-bold text-[#a5370c]">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.items && (
            <ul className="grid gap-2 sm:grid-cols-2 list-disc pl-5">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.outro && <p>{section.outro}</p>}
        </section>
      ))}

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold text-[#a5370c]">
          How to Check Satta King Result Today?
        </h2>
        <p>Checking a Satta result is simple:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Visit the result section.</li>
          <li>Select your preferred game name.</li>
          <li>Check the latest available result update.</li>
          <li>Open the chart section if you want previous records.</li>
        </ol>
        <p>
          Always confirm the correct market name because every Satta game has a
          separate result.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold text-[#a5370c]">
          Satta King Record Chart – Browse Old Results Easily
        </h2>
        <p>
          The Satta King Record Chart helps visitors explore previous results of
          different markets.
        </p>
        <p>
          Users can check historical records for: Gali Record Chart, Desawar
          Record Chart, Faridabad Result Chart, Ghaziabad Result Chart, Delhi
          Bazar Result Chart.
        </p>
        <p>
          Charts are useful for reviewing previous information but cannot
          guarantee future results.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-bold text-[#a5370c]">
          Frequently Asked Questions (FAQ)
        </h2>
        {faqs.map(([question, answer]) => (
          <div key={question} className="space-y-1">
            <h3 className="text-base font-bold text-[#a5370c]">{question}</h3>
            <p>{answer}</p>
          </div>
        ))}
      </section>

      <div className="h-20" />
    </article>
  );
}
