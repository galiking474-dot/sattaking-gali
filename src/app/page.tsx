import { AdSlot } from "@/components/layout/AdSlot";
import Link from "next/link";
import { format } from "date-fns";
import { FiPhone } from "react-icons/fi";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { WhatsAppModal } from "@/components/layout/WhatsAppModal";
import { MonthlyChartSection } from "@/components/home/MonthlyChartSection";
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
  getMonthlyChart,
  getSharedHomepageData,
} from "@/lib/api-helpers";
import {
  isTodayResultDeclared,
  parseClockTime,
  getISTMinutesOfDay,
} from "@/lib/utils";
import type { GameResult } from "@/lib/types";

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
  // resultSatta = our own scraped first section; homepage = LIVE/NEXT/REST read
  // read-only from the shared Firebase (kept fresh by the other scraper site).
  const [resultSatta, homepage, chart] = await Promise.all([
    getResultSattaData(),
    getSharedHomepageData(),
    getMonthlyChart(month, year),
  ]);

  const games = resultSatta?.games ?? [];
  const chartData = chart
    ? { month: chart.month, year: chart.year, results: chart.results }
    : { month: "", year: "", results: [] };

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

  // Scoreboard spotlight — latest declared result + the next upcoming game,
  // computed IST-aware from the first-section games.
  const nowMin = getISTMinutesOfDay(now);
  const timed = games
    .map((g) => ({ g, min: parseClockTime(g.time) }))
    .filter((x): x is { g: GameResult; min: number } => x.min !== null);
  const latest =
    timed
      .filter((x) => x.min <= nowMin && x.g.today)
      .sort((a, b) => b.min - a.min)[0]?.g ?? null;
  const upNext =
    timed.filter((x) => x.min > nowMin).sort((a, b) => a.min - b.min)[0]?.g ??
    null;
  const declaredCount = games.filter(
    (g) => isTodayResultDeclared(g.time) && g.today
  ).length;

  const updatedAt = format(now, "dd MMMM yyyy, hh:mm a") + " IST";
  const monthYear = format(now, "MMMM-yyyy");

  return (
    <ScrollAnimator>
      <WhatsAppModal />

      {/* Hero */}
      <div
        id="top"
        className="bg-gradient-to-b from-[#2e1065] to-[#4c1d95] text-white text-center py-5 md:py-8 px-3 md:px-4 border-b-4 border-[#f5b301]"
      >
        <h1 className="text-2xl sm:text-xl md:text-4xl font-extrabold tracking-tight mb-1 md:mb-2">
          Satta King Gali Result {year} &mdash; Live Gali, Desawar, Faridabad
          &amp; Ghaziabad
        </h1>
        <div className="mt-2.5 md:mt-4 inline-flex items-center gap-1.5 md:gap-2 bg-white/10 border border-[#f5b301]/40 rounded-full px-3 md:px-5 py-1.5 md:py-2 text-[14px] md:text-xs text-[#f5d67a]">
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#f5b301] rounded-full animate-live-pulse" />
          Last Updated: {updatedAt}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#3b0f6e] border-b border-[#5b21b6] py-1.5 md:py-2 px-2 md:px-4">
        <p className="text-center text-[12px] sm:text-[10px] md:text-xs text-purple-200 max-w-4xl mx-auto leading-relaxed">
          <span className="font-bold text-[#f5b301]">DISCLAIMER:</span>{" "}
          SattaKing-Gali.com is an independent informational website. We do not
          promote gambling or betting.{" "}
          <Link
            href="/disclaimer"
            className="text-[#f5b301] hover:underline font-medium"
          >
            Read Full Disclaimer
          </Link>
        </p>
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
        <ResultBoard games={games} />

        {/* Keyword buttons — SEO */}
        <KeywordButtons monthYear={monthYear} />

        {/* LIVE — games currently being declared (from shared Firebase) */}
        {liveResults.length > 0 && (
          <GameSection
            title="LIVE Results"
            subtitle="Games currently being declared"
            icon={<FiZap size={18} />}
            barColor="#dc2626"
            games={liveResults}
            isLive
          />
        )}

        {/* NEXT — upcoming */}
        {nextResults.length > 0 && (
          <GameSection
            title="Upcoming Results"
            subtitle="These games will be declared soon"
            icon={<FiClock size={18} />}
            barColor="#c2410c"
            games={nextResults}
          />
        )}

        {/* REST — declared */}
        {restResults.length > 0 && (
          <GameSection
            title="Declared Results"
            subtitle="Today's completed game results"
            icon={<FiTrendingUp size={18} />}
            barColor="#059669"
            games={restResults}
          />
        )}

        <AdSlot placement="homepage_middle" />

        {/* Game Schedule & Contact — shows the same games as the first section */}
        <GameScheduleSection games={games} />

        {/* Monthly Chart */}
        {chartData.results.length > 0 && (
          <MonthlyChartSection
            month={chartData.month}
            year={chartData.year}
            rows={chartData.results}
          />
        )}

        {/* Telegram Section */}
        <TelegramSection />

        <AdSlot placement="homepage_bottom" />

        {/* SEO Content */}
        <SeoContent />
      </div>
    </ScrollAnimator>
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
    <div className="bg-[#241247]">
      <div className="max-w-[1400px] mx-auto px-2 sm:px-3 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Latest declared */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] p-4 md:p-5 border border-[#f5b301]/40 overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#f5b301]/10" />
            <div className="flex items-center gap-2 text-[#f5d67a] text-[11px] md:text-xs font-bold uppercase tracking-widest">
              <FiAward /> Latest Result
            </div>
            {latest ? (
              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-extrabold text-lg md:text-2xl uppercase truncate">
                    {latest.name}
                  </p>
                  <p className="text-purple-200 text-[11px] md:text-xs font-medium">
                    {latest.time}
                  </p>
                </div>
                <div className="shrink-0 bg-[#f5b301] text-[#2e1065] font-extrabold font-mono text-3xl md:text-5xl rounded-xl px-4 py-1.5 shadow-lg">
                  {latest.today}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-purple-200 font-semibold">
                Waiting for today&apos;s first result…
              </p>
            )}
          </div>

          {/* Next upcoming */}
          <div className="relative rounded-2xl bg-white/5 p-4 md:p-5 border border-white/15 overflow-hidden">
            <div className="flex items-center gap-2 text-[#f5d67a] text-[11px] md:text-xs font-bold uppercase tracking-widest">
              <FiClock /> Next Game
            </div>
            {upNext ? (
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-extrabold text-lg md:text-2xl uppercase truncate">
                    {upNext.name}
                  </p>
                  <p className="text-purple-200 text-[11px] md:text-xs font-medium">
                    Result expected at {upNext.time}
                  </p>
                </div>
                <div className="shrink-0 inline-flex items-center gap-1.5 bg-[#dc2626] text-white text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-live-pulse" />{" "}
                  WAIT
                </div>
              </div>
            ) : (
              <p className="mt-3 text-purple-200 font-semibold">
                All of today&apos;s games are declared.
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
    <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-2 md:py-2.5">
      <span className="text-[#f5b301]">{icon}</span>
      <span className="text-white font-extrabold text-base md:text-xl">
        {value}
      </span>
      <span className="text-purple-300 text-[10px] md:text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
        {label}
        {live && (
          <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full animate-live-pulse" />
        )}
      </span>
    </div>
  );
}

// ─── First Section: ResultSatta Results Board ───

function ResultBoard({ games }: { games: GameResult[] }) {
  const today = format(new Date(), "MMMM d, yyyy");

  return (
    <section>
      <div className="bg-white rounded-xl border-2 border-[#4c1d95] overflow-hidden shadow-lg">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#4c1d95] to-[#6d28d9] text-white text-center py-3 px-3 border-b-2 border-[#f5b301]">
          <h2 className="text-base md:text-xl font-extrabold uppercase tracking-wide">
            Satta King Live Result
            <span className="inline-block w-2 h-2 bg-[#f5b301] rounded-full animate-live-pulse ml-2 align-middle" />
          </h2>
          <p className="text-[11px] md:text-xs font-normal text-[#f5d67a]">
            Superfast Satta Results &mdash; {today}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm md:text-base border-collapse">
            <thead>
              <tr className="bg-[#2e1065] text-[#f5d67a] text-xs md:text-sm uppercase">
                <th className="py-2.5 px-1 md:px-3 font-bold border border-[#5b21b6] text-left w-[46%] md:w-auto">
                  Game
                </th>
                <th className="py-2.5 px-1 md:px-3 font-bold border border-[#5b21b6] text-center hidden md:table-cell">
                  Time
                </th>
                <th className="py-2.5 px-1 md:px-3 font-bold border border-[#5b21b6] text-center w-[27%] md:w-auto">
                  Yesterday
                </th>
                <th className="py-2.5 px-1 md:px-3 font-bold border border-[#5b21b6] text-center w-[27%] md:w-auto">
                  Today
                </th>
              </tr>
            </thead>
            <tbody>
              {games.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-gray-400 font-medium border border-[#e6def7]"
                  >
                    Loading live results&hellip;
                  </td>
                </tr>
              )}
              {games.map((game, i) => {
                const slug = game.name.toLowerCase().replace(/\s+/g, "-");
                // The scraped `today` value lingers from the previous day after
                // midnight. Only trust it once this game's declared time has
                // actually passed in IST — otherwise it's not out yet.
                const declared = isTodayResultDeclared(game.time);
                const showToday = declared && game.today;
                return (
                  <tr
                    key={game.name + i}
                    className={`text-center ${
                      i % 2 === 0 ? "bg-white" : "bg-[#f6f2fd]"
                    }`}
                  >
                    <td className="py-2 px-1.5 md:px-3 text-left border border-[#e6def7]">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="min-w-0">
                          <div className="leading-tight break-words font-extrabold text-[#2e1065] uppercase text-[16px] md:text-2xl">
                            {game.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] md:hidden text-gray-500 font-normal">
                              {game.time}
                            </span>
                            <Link
                              href={`/chart/${slug}`}
                              className="text-[10px] md:text-sm font-medium text-[#7c3aed] hover:text-[#4c1d95]"
                            >
                              Record Chart &rarr;
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-1.5 px-1 md:px-3 font-mono font-bold text-gray-500 border border-[#e6def7] hidden md:table-cell">
                      {game.time}
                    </td>
                    <td className="py-1.5 px-1 md:px-3 font-mono text-[20px] sm:text-xs md:text-base font-bold text-[#4c1d95] border border-[#e6def7]">
                      {game.yesterday || "--"}
                    </td>
                    <td className="py-1.5 px-1 md:px-3 border border-[#e6def7]">
                      {showToday ? (
                        <span className="inline-block bg-[#f5b301]/20 text-[#c2410c] font-mono font-extrabold text-[20px] md:text-2xl rounded-lg px-2.5 md:px-3 py-0.5">
                          {game.today}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-bold text-[#dc2626]">
                          <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full animate-live-pulse" />
                          WAIT
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Generic LIVE / NEXT / REST Section (read from shared Firebase) ───

function GameSection({
  title,
  subtitle,
  barColor,
  games,
  isLive,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  barColor: string;
  games: GameResult[];
  isLive?: boolean;
}) {
  return (
    <section>
      <div className="bg-white rounded-xl border-2 border-[#4c1d95] overflow-hidden shadow-sm">
        {/* Title Bar */}
        <div
          className="text-white text-center py-2.5 px-3 text-sm md:text-base font-bold uppercase tracking-wide border-b-2 border-[#f5b301]"
          style={{ backgroundColor: barColor }}
        >
          {title}{" "}
          {isLive && (
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-live-pulse ml-1" />
          )}
          <span className="block text-[11px] md:text-xs font-normal normal-case tracking-normal opacity-90">
            {subtitle}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm md:text-base border-collapse">
            <thead>
              <tr className="bg-[#2e1065] text-[#f5d67a] text-xs md:text-sm uppercase">
                <th className="py-2 px-1 md:px-3 font-bold border border-[#5b21b6] text-left w-[46%] md:w-auto">
                  Game
                </th>
                <th className="py-2 px-1 md:px-3 font-bold border border-[#5b21b6] text-center hidden md:table-cell">
                  Time
                </th>
                <th className="py-2 px-1 md:px-3 font-bold border border-[#5b21b6] text-center w-[27%] md:w-auto">
                  Yest.
                </th>
                <th className="py-2 px-1 md:px-3 font-bold border border-[#5b21b6] text-center w-[27%] md:w-auto">
                  Today
                </th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, i) => {
                const slug = game.name.toLowerCase().replace(/\s+/g, "-");
                return (
                  <tr
                    key={game.name + i}
                    className={`text-center ${
                      i % 2 === 0 ? "bg-white" : "bg-[#f6f2fd]"
                    }`}
                  >
                    <td className="py-2 px-1.5 md:px-3 text-left border border-[#e6def7]">
                      <div className="leading-tight break-words font-extrabold text-[#2e1065] uppercase text-[17px] md:text-2xl">
                        {game.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] md:hidden text-gray-500 font-normal">
                          {game.time}
                        </span>
                        <Link
                          href={`/chart/${slug}`}
                          className="text-[10px] md:text-sm font-semibold text-[#7c3aed] hover:text-[#4c1d95]"
                        >
                          Record Chart &rarr;
                        </Link>
                      </div>
                    </td>
                    <td className="py-1.5 px-1 md:px-3 font-mono font-bold text-gray-500 border border-[#e6def7] hidden md:table-cell">
                      {game.time}
                    </td>
                    <td className="py-1.5 px-1 md:px-3 font-mono text-[20px] sm:text-xs md:text-base font-bold text-[#4c1d95] border border-[#e6def7]">
                      {game.yesterday || "--"}
                    </td>
                    <td className="py-1.5 px-1 md:px-3 font-mono text-[20px] sm:text-xs md:text-2xl font-extrabold border border-[#e6def7]">
                      {game.today ? (
                        <span className="text-[#c2410c]">{game.today}</span>
                      ) : isLive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-bold text-[#dc2626]">
                          <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full animate-live-pulse" />
                          WAIT
                        </span>
                      ) : (
                        "--"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
        href="/"
        className="block w-full text-center bg-gradient-to-r from-[#4c1d95] to-[#6d28d9] text-white font-bold text-sm md:text-lg py-3 md:py-4 rounded-xl shadow-md border-2 border-[#f5b301] hover:brightness-110 transition-all"
      >
        Click here to view the latest chart for all games for {monthYear}
      </Link>

      {/* Keyword grid — 2 per row */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* {KEYWORD_BUTTONS.map((kw) => (
          <Link
            key={kw}
            href="/"
            scroll={true}
            className="text-center bg-gradient-to-b from-[#f5b301] to-[#d4a017] text-[#2e1065] font-extrabold text-xs sm:text-sm md:text-lg py-3.5 md:py-4 rounded-xl border-2 border-[#7c3aed] shadow-sm hover:from-[#ffc93c] hover:to-[#e0b43a] hover:shadow-md transition-all"
          >
            {kw}
          </Link>
        ))} */}
        {KEYWORD_BUTTONS.map((kw) => (
          <a
            key={kw}
            href="/"
            className="text-center bg-gradient-to-b from-[#f5b301] to-[#d4a017] text-[#2e1065] font-extrabold text-xs sm:text-sm md:text-lg py-3.5 md:py-4 rounded-xl border-2 border-[#7c3aed]"
          >
            {kw}
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Game Schedule & Contact Section ───

function GameScheduleSection({ games }: { games: GameResult[] }) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";

  // Use the live first-section games (name + declared time) so this schedule
  // always matches the results board above. Fall back to a default list only if
  // the scrape hasn't populated yet.
  const fallback = [
    { name: "शिवधाम", time: "01:20 PM" },
    { name: "दिल्ली बाजार", time: "03:00 PM" },
    { name: "श्री गणेश", time: "04:20 PM" },
    { name: "फरीदाबाद", time: "06:00 PM" },
    { name: "गाज़ियाबाद", time: "09:20 PM" },
    { name: "गली", time: "11:20 PM" },
    { name: "दिसावर", time: "03:20 AM" },
  ];

  const gameSchedule =
    games.length > 0
      ? games.map((g) => ({ name: g.name, time: g.time }))
      : fallback;

  return (
    <section className="">
      <div className="flex items-center gap-2.5 md:gap-3 mb-3">
        <div className="p-2 rounded-lg bg-[#7c3aed] text-white shrink-0">
          <FiPhone size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl md:text-lg font-extrabold text-[#2e1065]">
            Game Schedule &amp; Contact
          </h2>
          <p className="text-[14px] md:text-xs text-gray-500">
            Game play करने के लिये संपर्क करे
          </p>
        </div>
      </div>

      {/* Gold contact card with purple dashed border */}
      <div className="rounded-2xl border-2 border-dashed border-[#7c3aed] bg-gradient-to-b from-[#FFD93B] via-[#FCE684] to-[#FEF9E7] px-4 md:px-10 py-6 md:py-9 text-center shadow-lg">
        <p className="text-[#2e1065] font-extrabold text-base md:text-2xl tracking-tight">
          &#11088; Direct Company No.1 Khaiwal &#11088;
        </p>
        <p className="text-[#2e1065] font-extrabold text-3xl md:text-5xl mt-1.5 md:mt-2 tracking-tight">
          GALI KING
        </p>

        {/* Game Schedule List */}
        <div className="max-w-xl mx-auto mt-5 md:mt-7 bg-[#FFFBEA] rounded-2xl border border-[#EBD98A] shadow-sm px-4 md:px-7 py-3 md:py-4 text-left">
          {gameSchedule.map((game, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 py-2.5 md:py-3 ${
                i !== gameSchedule.length - 1
                  ? "border-b border-dashed border-[#E0CF8A]"
                  : ""
              }`}
            >
              <span className="text-lg md:text-xl">&#9200;</span>
              <span className="text-[#2e1065] font-bold text-base md:text-xl">
                {game.name}
              </span>
              <span className="flex-1" />
              <span className="text-[#2e1065] font-extrabold text-base md:text-xl tracking-wide">
                {game.time}
              </span>
            </div>
          ))}
        </div>

        {/* Rate cards */}
        <div className="max-w-md mx-auto mt-6 md:mt-8 grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-xl border-2 border-[#7c3aed] px-4 py-3 shadow-sm">
            <p className="text-gray-500 font-bold text-[11px] md:text-xs uppercase tracking-widest">
              Jodi Rate
            </p>
            <p className="text-[#4c1d95] font-extrabold text-2xl md:text-3xl mt-0.5">
              10-950
            </p>
          </div>
          <div className="bg-white rounded-xl border-2 border-[#7c3aed] px-4 py-3 shadow-sm">
            <p className="text-gray-500 font-bold text-[11px] md:text-xs uppercase tracking-widest">
              Haruf Rate
            </p>
            <p className="text-[#4c1d95] font-extrabold text-2xl md:text-3xl mt-0.5">
              100-950
            </p>
          </div>
        </div>

        <p className="text-[#2e1065] font-extrabold text-sm md:text-lg uppercase tracking-wide mt-6 md:mt-8">
          PAYTM &bull; PHONEPE &bull; GOOGLE PAY &bull; BANK TRANSFER
        </p>

        <a
          href={`tel:+${phone.replace(/[^0-9]/g, "")}`}
          className="block text-[#4c1d95] font-extrabold text-3xl md:text-5xl tracking-tight underline underline-offset-4 decoration-2 mt-5 md:mt-7 hover:text-[#6d28d9] transition-colors break-all"
        >
          +{phone.replace(/[^0-9]/g, "")}
        </a>

        <a
          href={`https://wa.me/${phone.replace(
            /[^0-9]/g,
            ""
          )}?text=${encodeURIComponent("GALI KING")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1fb855] text-white font-extrabold text-lg md:text-xl px-8 py-3.5 rounded-full shadow-lg shadow-green-500/20 transition-all hover:scale-105 mt-6 md:mt-8"
        >
          <FaWhatsapp className="w-7 h-7 md:w-8 md:h-8" />
          <div className="text-left">
            <div className="text-lg md:text-xl font-extrabold leading-tight">
              WhatsApp
            </div>
            <div className="text-xs font-semibold opacity-90">
              Click To Chat
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}

// ─── Telegram Section ───

function TelegramSection() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";
  const waLink = `https://wa.me/${phone.replace(
    /[^0-9]/g,
    ""
  )}?text=${encodeURIComponent("GALI KING")}`;

  return (
    <div className="sa opacity-0 translate-y-8 bg-gradient-to-b from-[#2e1065] to-[#4c1d95] rounded-xl border border-[#5b21b6] p-5 md:p-8 text-center space-y-4 shadow-lg">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0088cc]/20 mb-1">
        <FaTelegramPlane className="w-7 h-7 text-[#38bdf8]" />
      </div>
      <h3 className="text-white font-extrabold text-lg md:text-xl">
        Satta King Daily Passing Tricks
      </h3>
      <p className="text-purple-200 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
        Delhi Bazar se Disawar tak daily passing pane ke liye hamare WhatsApp
        par contact karein.
      </p>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#f5b301] hover:bg-[#e0b43a] text-[#2e1065] font-extrabold text-base md:text-lg px-6 py-3 rounded-full shadow-lg transition-all hover:scale-105"
      >
        <FaWhatsapp className="w-5 h-5" />
        Join Now
      </a>
      <p className="text-purple-300 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
        Website ko bookmark kar lo, taaki aapko rozana 2-3 game passing aur
        latest updates milti rahein.
      </p>
    </div>
  );
}

// ─── SEO Content ───

function SeoContent() {
  const year = new Date().getFullYear();
  return (
    <div className="sa opacity-0 translate-y-8 bg-white rounded-xl border border-[#e6def7] p-4 md:p-8 space-y-4 md:space-y-5 text-xs md:text-sm text-gray-600 leading-relaxed shadow-sm">
      <h2 className="text-xl md:text-2xl font-extrabold text-[#2e1065]">
        Satta King Gali Result {year}
      </h2>
      <p>
        Welcome to SattaKing-Gali, where you can check the latest Satta King
        results updated every day. We provide fast and accurate results for
        popular markets including Gali, Desawar, Faridabad, Ghaziabad, Delhi
        Bazar and Shree Ganesh. Our goal is to make it easy for visitors to find
        today&apos;s results, previous records and daily updates in one place.
      </p>

      <h2 className="text-xl font-bold text-[#2e1065]">
        Live Satta King Result
      </h2>
      <p>
        Our website updates the latest Satta King results throughout the day.
        Whether you are looking for Gali Result, Desawar Result, Faridabad
        Result or Ghaziabad Result, you can check all available market results
        quickly.
      </p>

      <h2 className="text-xl font-bold text-[#2e1065]">Gali Result Today</h2>
      <p>
        Gali is one of the most searched Satta markets. We publish the latest
        Gali Result along with previous records so users can easily review
        earlier outcomes.
      </p>

      <h2 className="text-xl font-bold text-[#2e1065]">Desawar Result Today</h2>
      <p>
        Find the latest Desawar Result with daily updates. Historical results
        are also available to help visitors check previous records.
      </p>

      <h2 className="text-xl font-bold text-[#2e1065]">Satta King Chart</h2>
      <p>
        Our website also provides Satta King charts for different markets. You
        can view old records and previous results for reference using the Record
        Chart links beside each game.
      </p>

      <h2 className="text-xl font-bold text-[#2e1065]">
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

      <h2 className="text-xl font-bold text-[#2e1065]">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#2e1065]">
            What is SattaKing-Gali?
          </h3>
          <p>
            SattaKing-Gali shows the latest daily results for popular Satta King
            markets including Gali, Desawar, Faridabad and Ghaziabad.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#2e1065]">
            How often are results updated?
          </h3>
          <p>
            Results are updated as soon as the respective market declares them.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#2e1065]">
            Can I check old Satta results?
          </h3>
          <p>
            Yes. Previous results and charts are available for different
            markets.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#2e1065]">
            Is this website mobile friendly?
          </h3>
          <p>
            Yes. The website is designed to work smoothly on mobile, tablet and
            desktop devices.
          </p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-[#2e1065]">Disclaimer</h3>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-xs text-purple-800">
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
