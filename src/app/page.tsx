import { AdSlot } from "@/components/layout/AdSlot";
import Link from "next/link";
import { format } from "date-fns";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
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
  getMonthlyChart,
  getSharedHomepageData,
} from "@/lib/api-helpers";
import {
  isTodayResultDeclared,
  parseClockTime,
  getISTMinutesOfDay,
} from "@/lib/utils";
import { FEATURED_GAMES } from "@/lib/featured-games";
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

  // Scoreboard spotlight — latest declared result + the next upcoming game.
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

  const schedule =
    games.length > 0 ? games.map((g) => ({ name: g.name, time: g.time })) : [];

  return (
    <ScrollAnimator>
      <WhatsAppModal />

      {/* Hero */}
      <div
        id="top"
        className="bg-gradient-to-b from-[#FFD93B] to-[#F5A623] text-[#3a1d00] text-center py-5 md:py-8 px-3 md:px-4 border-b-4 border-[#e0850b]"
      >
        <h1 className="text-2xl sm:text-xl md:text-4xl font-extrabold tracking-tight mb-1 md:mb-2">
          Satta King Gali Result {year} &mdash; Live Gali, Desawar, Faridabad
          &amp; Ghaziabad
        </h1>
        <div className="mt-2.5 md:mt-4 inline-flex items-center gap-1.5 md:gap-2 bg-white/50 border border-[#e0850b]/50 rounded-full px-3 md:px-5 py-1.5 md:py-2 text-[14px] md:text-xs text-[#7a4a00] font-semibold">
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#a5370c] rounded-full animate-live-pulse" />
          Last Updated: {updatedAt}
        </div>

        {/* Featured market quick-links */}
        <FeaturedGameLinks />
      </div>

      {/* Disclaimer */}
      <div className="bg-[#a5370c] border-b border-[#7a2b08] py-1.5 md:py-2 px-2 md:px-4">
        <p className="text-center text-[12px] sm:text-[10px] md:text-xs text-[#ffe6c7] max-w-4xl mx-auto leading-relaxed">
          <span className="font-bold text-[#FFE071]">DISCLAIMER:</span>{" "}
          SattaKing-Gali.com is an independent informational website. We do not
          promote gambling or betting.{" "}
          <Link
            href="/disclaimer"
            className="text-[#FFE071] hover:underline font-medium"
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

        {/* Khaiwal / Game Schedule & Contact — directly under the first section */}
        <KhaiwalCard games={schedule} />

        {/* Keyword buttons — SEO */}
        <KeywordButtons monthYear={monthYear} />

        {/* Monthly Chart — shown above the LIVE/NEXT/REST sections */}
        {chartData.results.length > 0 && (
          <MonthlyChartSection
            month={chartData.month}
            year={chartData.year}
            rows={chartData.results}
          />
        )}

        {/* LIVE — games currently being declared (from shared Firebase) */}
        {liveResults.length > 0 && (
          <GameSection
            title="LIVE Results"
            subtitle="Games currently being declared"
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
            barColor="#ea580c"
            games={nextResults}
          />
        )}

        {/* REST — declared */}
        {restResults.length > 0 && (
          <GameSection
            title="Declared Results"
            subtitle="Today's completed game results"
            barColor="#059669"
            games={restResults}
          />
        )}

        <AdSlot placement="homepage_middle" />

        {/* Telegram Section */}
        <TelegramSection />

        <AdSlot placement="homepage_bottom" />

        {/* SEO Content */}
        <SeoContent />
      </div>
    </ScrollAnimator>
  );
}

// ─── Featured market quick-links (hero) ───

function FeaturedGameLinks() {
  return (
    <div className="mt-4 md:mt-5 max-w-3xl mx-auto grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
      {FEATURED_GAMES.map((g) => (
        <Link
          key={g.slug}
          href={`/game/${g.slug}`}
          className="text-center bg-white/85 hover:bg-white text-[#a5370c] font-extrabold text-[11px] sm:text-xs md:text-sm py-2 md:py-2.5 px-1 rounded-lg border border-[#e0850b] shadow-sm hover:shadow-md transition-all leading-tight"
        >
          {g.name}
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
          {/* Latest declared */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#FFF7DA] to-[#FCE38A] p-4 md:p-5 border-2 border-[#e0850b] overflow-hidden shadow-sm">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#f5b301]/20" />
            <div className="flex items-center gap-2 text-[#a5370c] text-[11px] md:text-xs font-bold uppercase tracking-widest">
              <FiAward /> Latest Result
            </div>
            {latest ? (
              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[#3a1d00] font-extrabold text-lg md:text-2xl uppercase truncate">
                    {latest.name}
                  </p>
                  <p className="text-[#8a6d2f] text-[11px] md:text-xs font-medium">
                    {latest.time}
                  </p>
                </div>
                <div className="shrink-0 bg-white text-[#dc2626] font-extrabold font-mono text-3xl md:text-5xl rounded-xl px-4 py-1.5 shadow-md border border-[#f0d98a]">
                  {latest.today}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[#8a6d2f] font-semibold">
                Waiting for today&apos;s first result…
              </p>
            )}
          </div>

          {/* Next upcoming */}
          <div className="relative rounded-2xl bg-white/70 p-4 md:p-5 border-2 border-[#f0d98a] overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 text-[#a5370c] text-[11px] md:text-xs font-bold uppercase tracking-widest">
              <FiClock /> Next Game
            </div>
            {upNext ? (
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[#3a1d00] font-extrabold text-lg md:text-2xl uppercase truncate">
                    {upNext.name}
                  </p>
                  <p className="text-[#8a6d2f] text-[11px] md:text-xs font-medium">
                    Result expected at {upNext.time}
                  </p>
                </div>
                <div
                  title="Result awaited"
                  aria-label="Result awaited"
                  className="shrink-0 inline-flex items-center justify-center w-11 h-11 bg-white text-[#d97706] rounded-full shadow border border-[#f0d98a]"
                >
                  <FiClock className="w-6 h-6 animate-watch-tick" />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[#8a6d2f] font-semibold">
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

function ResultBoard({ games }: { games: GameResult[] }) {
  const today = format(new Date(), "MMMM d, yyyy");

  return (
    <section>
      <div className="bg-white rounded-2xl border-2 border-[#e0850b] overflow-hidden shadow-lg">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#FFD93B] to-[#F5A623] text-[#a5370c] text-center py-3 px-3 border-b-2 border-[#e0850b]">
          <h2 className="text-base md:text-xl font-extrabold uppercase tracking-wide">
            Satta King Live Result
            <span className="inline-block w-2 h-2 bg-[#a5370c] rounded-full animate-live-pulse ml-2 align-middle" />
          </h2>
          <p className="text-[11px] md:text-xs font-semibold text-[#7a4a00]">
            Superfast Satta Results &mdash; {today}
          </p>
        </div>

        {/* Table */}
        {games.length === 0 ? (
          <div className="py-8 text-center text-[#b09a5a] font-medium bg-[#FFFDF3]">
            Loading live results&hellip;
          </div>
        ) : (
          <GameTable>
            {games.map((game, i) => {
              // The scraped `today` value lingers from the previous day after
              // midnight. Only trust it once this game's declared time has
              // actually passed in IST — otherwise it's not out yet.
              const declared = isTodayResultDeclared(game.time);
              const showToday = declared && game.today;
              return (
                <GameRow
                  key={game.name + i}
                  i={i}
                  game={game}
                  today={showToday ? game.today : null}
                  showWatch={!showToday}
                />
              );
            })}
          </GameTable>
        )}
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
  barColor: string;
  games: GameResult[];
  isLive?: boolean;
}) {
  return (
    <section>
      <div className="bg-white rounded-2xl border-2 border-[#e0850b] overflow-hidden shadow-sm">
        {/* Title Bar */}
        <div
          className="text-white text-center py-2.5 px-3 text-sm md:text-base font-bold uppercase tracking-wide border-b-2 border-[#e0850b]"
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
        <GameTable>
          {games.map((game, i) => (
            <GameRow
              key={game.name + i}
              i={i}
              game={game}
              today={game.today || null}
              showWatch={!!isLive}
              live={isLive}
            />
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
        href="/"
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

// ─── Telegram Section ───

function TelegramSection() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";
  const waLink = `https://wa.me/${phone.replace(
    /[^0-9]/g,
    ""
  )}?text=${encodeURIComponent("GALI KING")}`;

  return (
    <div className="sa opacity-0 translate-y-8 bg-gradient-to-b from-[#a5370c] to-[#d97706] rounded-xl border border-[#7a2b08] p-5 md:p-8 text-center space-y-4 shadow-lg">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-1">
        <FaTelegramPlane className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-white font-extrabold text-lg md:text-xl">
        Satta King Daily Passing Tricks
      </h3>
      <p className="text-[#ffe6c7] text-sm md:text-base leading-relaxed max-w-lg mx-auto">
        Delhi Bazar se Disawar tak daily passing pane ke liye hamare WhatsApp
        par contact karein.
      </p>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#FFE071] hover:bg-[#ffd94a] text-[#a5370c] font-extrabold text-base md:text-lg px-6 py-3 rounded-full shadow-lg transition-all hover:scale-105"
      >
        <FaWhatsapp className="w-5 h-5" />
        Join Now
      </a>
      <p className="text-[#ffdcb0] text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
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
