import { Fragment } from "react";
import { AdSlot } from "@/components/layout/AdSlot";
import Link from "next/link";
import { format } from "date-fns";
import { WhatsAppModal } from "@/components/layout/WhatsAppModal";
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
  isTodayResultDeclared,
  parseClockTime,
  getISTMinutesOfDay,
} from "@/lib/utils";
import { FEATURED_GAMES } from "@/lib/featured-games";
import type { GameResult } from "@/lib/types";
import { log } from "console";

// Server-render the page and revalidate at most once every 30s. The results board
// + charts are cached at the edge, so a traffic spike triggers at most one
// regeneration per window — no per-request scraping, no client fetch waterfall.
export const revalidate = 30;

// ─── Main Page (Server Component) ───

export default async function HomePage() {
  const now = new Date();
  const month = format(now, "MMMM").toLowerCase();
  const year = format(now, "yyyy");

  // Fetch everything on the server, directly from the data layer (no self-HTTP).
  const [resultSatta, homepage, chart] = await Promise.all([
    getResultSattaData(),
    getSharedHomepageData(),
    getSatta29Chart(month, year),
  ]);

  const games = resultSatta?.games ?? [];
  const chartData = chart
    ? { month: chart.month, year: chart.year, games: chart.games, rows: chart.rows }
    : { month: "", year: "", games: [] as string[], rows: [] };

  // Don't repeat first-section games in LIVE/NEXT/REST — dedupe by normalized name.
  const firstSectionNames = new Set(
    games.map((g) => g.name.toLowerCase().replace(/\s+/g, ""))
  );
  const notInFirst = (g: GameResult) =>
    !firstSectionNames.has(g.name.toLowerCase().replace(/\s+/g, "")) &&
    !g.name.toLowerCase().includes("show your game here");
  const liveResults = (homepage?.live ?? []).filter(notInFirst);
  const nextResults = (homepage?.next ?? []).filter(notInFirst);
  const restResults = (homepage?.rest ?? []).filter(notInFirst);

  // Scoreboard spotlight — latest declared result + the next awaited game.
  const nowMin = getISTMinutesOfDay(now);
  const timed = games
    .map((g) => ({ g, min: parseClockTime(g.time) }))
    .filter((x): x is { g: GameResult; min: number } => x.min !== null);
  const latest =
    timed
      .filter((x) => x.min <= nowMin && x.g.today)
      .sort((a, b) => b.min - a.min)[0]?.g ?? null;
  // Next game = the earliest game (in daily schedule order) whose result has
  // NOT been declared yet. It stays on that game until its result actually
  // arrives — even if its declared time has already passed (result running
  // late) — instead of jumping ahead on the clock. Early-morning games (e.g.
  // Desawar ~05 AM) belong at the end of the cycle, so shift them past midnight.
  const MORNING_CUTOFF = 12 * 60;
  const scheduleMin = (min: number) =>
    min < MORNING_CUTOFF ? min + 1440 : min;
  const upNext =
    timed
      .filter((x) => !x.g.today)
      .sort((a, b) => scheduleMin(a.min) - scheduleMin(b.min))[0]?.g ?? null;
  const declaredCount = games.filter(
    (g) => isTodayResultDeclared(g.time) && g.today
  ).length;

  const updatedAt = format(now, "dd MMMM yyyy, hh:mm a") + " IST";
  const monthYear = format(now, "MMMM-yyyy");

  const schedule =
    games.length > 0 ? games.map((g) => ({ name: g.name, time: g.time })) : [];

  return (
    <ScrollAnimator>
      <WhatsAppModal />

      {/* Hero */}
      <div
        id="top"
        className="bg-white text-[#3a1d00] text-center py-5 md:py-8 px-3 md:px-4 border-b-4 border-[#e0850b]"
      >
        <h1 className="text-lg sm:text-xl md:text-2xl font-normal tracking-tight mb-1 md:mb-2">
          Satta King Gali {year}: Fast Live Results for Desawar, Faridabad,
          Ghaziabad, Gali &amp; More &mdash; Updated Every Day
        </h1>

        {/* Featured market quick-links */}
        <FeaturedGameLinks />
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

      {/* Scoreboard spotlight — distinct hero band */}
      <Scoreboard
        latest={latest}
        upNext={upNext}
        total={games.length}
        declared={declaredCount}
      />

      <div className="max-w-[1400px] mx-auto px-2 sm:px-3 md:px-6 py-4 md:py-6 space-y-6 md:space-y-8">
        <AdSlot placement="homepage_top" />

        {/* FIRST SECTION — Results board scraped from resultsatta.com */}
        <ResultBoard games={games} liveResults={liveResults}
  nextResults={nextResults}
  restResults={restResults} />

        {/* Khaiwal / Game Schedule & Contact — directly under the first section */}
        <KhaiwalCard games={schedule} />

        {/* Keyword buttons — SEO */}
        <KeywordButtons monthYear={monthYear} />

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
  latest: GameResult | null;
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
                  <span className="text-[10px] md:text-xs font-extrabold tracking-widest">WAIT</span>
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
                    {latest.name}
                  </p>
                  <p className="text-[#FCE38A] text-xs md:text-sm font-semibold mt-1">
                    {latest.time}
                  </p>
                </div>
                <div className="shrink-0 bg-white text-[#dc2626] font-extrabold font-mono text-5xl md:text-7xl rounded-2xl px-5 md:px-7 py-1.5 md:py-2 animate-result-glow leading-none">
                  {latest.today}
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

function ResultBoard({ games,liveResults,
  nextResults,
  restResults, }: { games: GameResult[],liveResults: GameResult[];
  nextResults: GameResult[];
  restResults: GameResult[]; }) {

    const homepageGames = [
      ...liveResults,
      ...nextResults,
      ...restResults,
    ];
    // console.log("restResults",restResults);
    
    
   
    const replaceGames = [
      "delhi bazar",
      "shri ganesh",
      "faridabad",
      "ghaziabad",
      "gali",
      "desawar",
    ];
    const normalize = (name: string) =>
      name
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace("desawer", "desawar")
        .replace("shreeganesh", "shriganesh");
   
        const homepageMap = new Map(
          homepageGames.map((g) => [normalize(g.name), g])
        );
        
        const finalGames = games.map((g) => {
          const hp = homepageMap.get(normalize(g.name));
        
          if (hp) {
            console.log("MATCH", g.name);
        
            return {
              ...g,
              today: hp.today ?? g.today,
              yesterday: hp.yesterday ?? g.yesterday,
              time: hp.time || g.time,
            };
          }
        
          return g;
        });
    
  const istHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
  
  // console.log("IST Hour:", istHour);
  const now = new Date();
  
  // Raat 12 baje se subah 5 baje tak
  const shouldShiftResults = istHour < 5;
  // console.log("Shift Results:", shouldShiftResults);
  
  const displayGames = finalGames.map((g) => {
    if (!shouldShiftResults) return g;

    return {
      ...g,
      yesterday: g.today || g.yesterday,
      today: "",
    };
  });

  const today = format(now, "MMMM d, yyyy");
 
  return (
    <section>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
        {/* Title Bar */}
        <div className="bg-white text-black text-center py-3 px-3 border-b-2 border-[#e0850b]">
          <h2 className="text-base md:text-xl font-extrabold uppercase tracking-wide text-black">
            Satta King Live Result
            <span className="inline-block w-2 h-2 bg-[#dc2626] rounded-full animate-live-pulse ml-2 align-middle" />
          </h2>
          <p className="text-[11px] md:text-xs font-semibold text-black">
            Superfast Satta Results &mdash; {today}
          </p>
          <p className="text-[11px] md:text-xs font-medium text-black/70 mt-1 max-w-2xl mx-auto leading-relaxed">
            Check today&apos;s Satta King Gali result live &mdash; fast &amp;
            accurate Gali, Desawar, Faridabad and Ghaziabad numbers updated
            every day.
          </p>
        </div>

        {/* Boxes grid */}
        {displayGames.length === 0 ? (
          <div className="py-8 text-center text-[#b09a5a] font-medium bg-[#FFFDF3]">
            Loading live results&hellip;
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 md:gap-4 p-3 md:p-4 bg-[#FFFDF3]">
            {displayGames.map((game, i) => {
              // The scraped `today` value lingers from the previous day after
              // midnight. Only trust it once this game's declared time has
              // actually passed in IST — otherwise it's not out yet.
              const declared = isTodayResultDeclared(game.time);
              const showToday = declared && game.today;            
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

// ─── Keyword Buttons Section (SEO) ───

const KEYWORD_BUTTONS = [
  "Play Bazaar",
  "Satta King 786",
  "Satta King Fast",
  "Satta King UP",
  "Delhi Satta King",
  "Black Satta King",
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
        {KEYWORD_BUTTONS.map((kw) => (
          <Link
            key={kw}
            href="/#top"
            className="text-center bg-gradient-to-b from-[#FFD93B] to-[#d4a017] text-[#3a1d00] font-extrabold text-xs sm:text-sm md:text-lg py-3.5 md:py-4 rounded-xl border-2 border-[#e0850b] shadow-sm hover:brightness-105 transition-all"
          >
            {kw}
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── SEO Content ───

function SeoContent() {
  const year = new Date().getFullYear();
  return (
    <div className="sa opacity-0 translate-y-8 bg-white rounded-xl border border-[#f0e2a6] p-4 md:p-8 space-y-4 md:space-y-5 text-xs md:text-sm text-gray-600 leading-relaxed shadow-sm">
      <h2 className="text-xl md:text-2xl font-extrabold text-[#a5370c]">
        Satta King Gali Result {year}
      </h2>
      <p>
        Welcome to SattaKing-Gali, where you can check the latest Satta King
        results updated every day. We provide fast and accurate results for
        popular markets including Gali, Desawar, Faridabad, Ghaziabad, Delhi
        Bazar and Shree Ganesh. Our goal is to make it easy for visitors to find
        today&apos;s results, previous records and daily updates in one place.
      </p>

      <h2 className="text-xl font-bold text-[#a5370c]">Live Satta King Result</h2>
      <p>
        Our website updates the latest Satta King results throughout the day.
        Whether you are looking for Gali Result, Desawar Result, Faridabad
        Result or Ghaziabad Result, you can check all available market results
        quickly.
      </p>

      <h2 className="text-xl font-bold text-[#a5370c]">Gali Result Today</h2>
      <p>
        Gali is one of the most searched Satta markets. We publish the latest
        Gali Result along with previous records so users can easily review
        earlier outcomes.
      </p>

      <h2 className="text-xl font-bold text-[#a5370c]">Desawar Result Today</h2>
      <p>
        Find the latest Desawar Result with daily updates. Historical results
        are also available to help visitors check previous records.
      </p>

      <h2 className="text-xl font-bold text-[#a5370c]">Satta King Chart</h2>
      <p>
        Our website also provides Satta King charts for different markets. You
        can view old records and previous results for reference using the Record
        Chart links beside each game.
      </p>

      <h2 className="text-xl font-bold text-[#a5370c]">
        Why Choose SattaKing-Gali?
      </h2>
      <ul className="list-none space-y-2 pl-0">
        {[
          "Fast daily result updates",
          "Mobile-friendly website",
          "Easy navigation",
          "Daily market records",
          "Historical charts",
          "Simple and clean design",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <span className="text-[#f5b301] mt-0.5">&#10003;</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold text-[#a5370c]">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#a5370c]">
            What is SattaKing-Gali?
          </h3>
          <p>
            SattaKing-Gali shows the latest daily results for popular Satta King
            markets including Gali, Desawar, Faridabad and Ghaziabad.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#a5370c]">
            How often are results updated?
          </h3>
          <p>
            Results are updated as soon as the respective market declares them.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#a5370c]">
            Can I check old Satta results?
          </h3>
          <p>
            Yes. Previous results and charts are available for different markets.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#a5370c]">
            Is this website mobile friendly?
          </h3>
          <p>
            Yes. The website is designed to work smoothly on mobile, tablet and
            desktop devices.
          </p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-[#a5370c]">Disclaimer</h3>
      <div className="bg-[#fff7e0] border border-[#f0e2a6] rounded-lg p-4 text-xs text-[#8a6d2f]">
        This website is provided for informational purposes only. We do not own,
        operate, or facilitate any form of online gambling, lottery, betting, or
        Satta Matka operations. Participation in these activities may be illegal
        or restricted under your local state laws. Visitors should use the
        information responsibly and comply with the laws applicable in their
        location.
      </div>
      <div className="h-20" />
    </div>
  );
}
