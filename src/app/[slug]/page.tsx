import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { FiClock, FiArrowRight, FiAward, FiBarChart2 } from "react-icons/fi";
import { getSatta29Chart } from "@/lib/api-helpers";
import { getFeaturedGame, FEATURED_GAMES } from "@/lib/featured-games";
import { KhaiwalCard } from "@/components/home/KhaiwalCard";

// Revalidate at the edge every 30s, same cadence as the homepage.
export const revalidate = 30;

const RESULT_SUFFIX = "-result";

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SEO_KEYWORDS = [
  "Satta King",
  "Satta Result",
  "Gali Result",
  "Desawar Result",
  "Satta King Fast",
  "Play Bazaar",
  "Black Satta King",
  "Delhi Satta King",
];

function cleanVal(v?: string): string {
  if (!v) return "";
  const t = v.trim();
  if (t === "" || t === "--" || t.toUpperCase() === "XX") return "";
  return t;
}

// The base game slug for a "/<slug>-result" URL, or null if the URL isn't a
// result page at all.
function baseSlug(slug: string): string | null {
  if (!slug.endsWith(RESULT_SUFFIX)) return null;
  return slug.slice(0, -RESULT_SUFFIX.length);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const base = baseSlug(slug);
  const game = base ? getFeaturedGame(base) : undefined;
  if (!game) return { title: "Satta King Result" };

  const title = `${game.name} Satta King Result Today | Live ${game.name} Chart & Record`;
  const description = `${game.blurb} View the ${game.name} yearly record chart, monthly results and Khaiwal contact.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function GameResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = baseSlug(slug);
  const game = base ? getFeaturedGame(base) : undefined;
  if (!game) notFound();

  const now = new Date();
  const year = now.getFullYear();
  const curMonth = now.getMonth(); // 0-based
  const monthsToShow = MONTHS_FULL.slice(0, curMonth + 1);

  // Pull the satta29 combined monthly chart for every month of the current year
  // up to now and read this game's column (by its exact satta29 header name).
  const charts = await Promise.all(
    monthsToShow.map((m) => getSatta29Chart(m.toLowerCase(), String(year)))
  );

  // grid[monthIndex][date] = value ("" when not declared)
  const grid: Record<number, Record<number, string>> = {};
  charts.forEach((chart, mIdx) => {
    grid[mIdx] = {};
    (chart?.rows ?? []).forEach((row) => {
      const day = parseInt(row.date.split("-")[2] || "", 10);
      if (!Number.isNaN(day)) {
        grid[mIdx][day] = cleanVal(row.values[game.satta29Name]);
      }
    });
  });

  // Chronological timeline of declared results → latest = today, prev = yesterday.
  const timeline: { m: number; d: number; v: string }[] = [];
  for (let m = 0; m <= curMonth; m++) {
    const g = grid[m] || {};
    Object.keys(g)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((d) => {
        if (g[d]) timeline.push({ m, d, v: g[d] });
      });
  }
  const todayEntry = timeline[timeline.length - 1] ?? null;
  const yestEntry = timeline[timeline.length - 2] ?? null;

  const todayLabel = todayEntry
    ? `${todayEntry.d} ${MONTHS_ABBR[todayEntry.m]} ${year}`
    : format(now, "dd MMM yyyy");

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-3 md:px-6 py-4 md:py-6 space-y-6 md:space-y-8">
      {/* Breadcrumb / other markets */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {FEATURED_GAMES.map((g) => (
          <Link
            key={g.slug}
            href={`/${g.slug}-result`}
            className={`text-[11px] md:text-sm font-bold px-3 py-1.5 rounded-full border transition-all ${
              g.slug === game.slug
                ? "bg-[#a5370c] text-[#FFE071] border-[#a5370c]"
                : "bg-white text-[#a5370c] border-[#e0850b] hover:bg-[#fff7e0]"
            }`}
          >
            {g.name}
          </Link>
        ))}
      </div>

      {/* ── SECTION 1: Today's result ── */}
      <section>
        <div className="rounded-2xl bg-gradient-to-b from-[#FFF7DA] to-[#FCE38A] border-2 border-[#e0850b] shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#FFD93B] to-[#F5A623] text-[#a5370c] text-center py-2.5 px-3 border-b-2 border-[#e0850b]">
            <div className="flex items-center justify-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-widest">
              <FiAward /> {game.name} Result Today
            </div>
          </div>

          <div className="px-4 md:px-8 py-5 md:py-7 text-center">
            <p className="text-[#8a6d2f] text-xs md:text-sm font-semibold">
              {todayLabel} &bull; {game.time}
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#1e293b] uppercase mt-1 tracking-tight">
              {game.name}
            </h1>

            <div className="mt-4 flex items-stretch justify-center gap-3 md:gap-4 max-w-md mx-auto">
              <div className="flex-1 rounded-xl bg-[#FBEEC2] border border-[#EFD98A] px-3 py-3 text-center">
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#8a6d2f]">
                  Yesterday
                </div>
                <div className="font-mono font-extrabold text-3xl md:text-5xl text-[#1e293b] leading-none mt-1.5">
                  {yestEntry ? yestEntry.v : "--"}
                </div>
              </div>

              <div className="flex items-center">
                <FiArrowRight className="w-7 h-7 md:w-9 md:h-9 text-[#f59e0b]" />
              </div>

              <div className="flex-1 rounded-xl bg-[#F6D68A] border border-[#E7B85C] px-3 py-3 text-center">
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#a5370c]">
                  Today
                </div>
                <div className="mt-1.5 flex items-center justify-center min-h-[36px] md:min-h-[56px] leading-none">
                  {todayEntry ? (
                    <span className="font-mono font-extrabold text-3xl md:text-5xl text-[#dc2626]">
                      {todayEntry.v}
                    </span>
                  ) : (
                    <span
                      title="Result awaited"
                      aria-label="Result awaited"
                      className="text-[#a5370c]"
                    >
                      <FiClock className="w-8 h-8 md:w-10 md:h-10 animate-watch-tick" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[#8a6d2f] text-xs md:text-sm mt-4 max-w-xl mx-auto leading-relaxed">
              {game.blurb}
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Current-year record chart (up to this month) ── */}
      <section>
        <div className="flex items-center gap-2.5 md:gap-3 mb-3">
          <div className="p-2 rounded-lg bg-[#d97706] text-white shrink-0">
            <FiBarChart2 size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl md:text-lg font-extrabold text-[#a5370c]">
              {game.name} Chart {year}
            </h2>
            <p className="text-[14px] md:text-xs text-[#8a6d2f]">
              January to {MONTHS_FULL[curMonth]} {year} record
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#e0850b] overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-[#FFD93B] to-[#F5A623] text-[#a5370c] text-center py-2.5 font-bold border-b-2 border-[#e0850b] text-sm md:text-base">
            {game.name} Yearly Record &mdash; {year}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px] md:text-base">
              <thead>
                <tr className="bg-[#a5370c] text-[#FFE071] uppercase text-[11px] md:text-sm">
                  <th className="py-2 px-1.5 md:px-3 font-bold border border-[#c2600f] sticky left-0 bg-[#a5370c]">
                    Date
                  </th>
                  {monthsToShow.map((_, mIdx) => (
                    <th
                      key={mIdx}
                      className="py-2 px-1 md:px-3 font-bold border border-[#c2600f]"
                    >
                      {MONTHS_ABBR[mIdx]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d, ri) => (
                  <tr
                    key={d}
                    className={`text-center ${ri % 2 === 0 ? "bg-white" : "bg-[#fffbe9]"}`}
                  >
                    <td className="py-1.5 px-1.5 md:px-3 font-extrabold text-[#dc2626] border border-[#f0e2a6] sticky left-0 bg-inherit">
                      {d}
                    </td>
                    {monthsToShow.map((_, mIdx) => {
                      const v = grid[mIdx]?.[d] || "";
                      const isToday =
                        todayEntry &&
                        todayEntry.m === mIdx &&
                        todayEntry.d === d;
                      return (
                        <td
                          key={mIdx}
                          className={`py-1.5 px-1 md:px-3 font-mono font-bold border border-[#f0e2a6] ${
                            isToday ? "text-[#dc2626] bg-[#F6D68A]" : "text-[#1e293b]"
                          }`}
                        >
                          {v || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center py-2 border-t border-[#f0e2a6]">
            <Link
              href="/charts"
              className="text-[#a5370c] hover:text-[#d97706] hover:underline text-xs md:text-sm font-bold"
            >
              View full monthly record chart &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Khaiwal chart / contact ── */}
      <KhaiwalCard />

      {/* ── SECTION 4: SEO content + keywords ── */}
      <section className="bg-white rounded-xl border border-[#f0e2a6] p-4 md:p-8 space-y-4 md:space-y-5 text-xs md:text-sm text-gray-600 leading-relaxed shadow-sm">
        <h2 className="text-xl md:text-2xl font-extrabold text-[#a5370c]">
          {game.name} Satta King Result {year}
        </h2>
        <p>
          Looking for the latest <strong>{game.name} Satta King result</strong>?
          You are at the right place. On this page we publish today&apos;s{" "}
          {game.name} result as soon as it is declared at {game.time}, along with
          the complete {year} record chart. {game.blurb}
        </p>

        <h2 className="text-lg md:text-xl font-bold text-[#a5370c]">
          {game.name} Result Chart {year}
        </h2>
        <p>
          The {game.name} chart above shows every declared number for the current
          year, month by month. You can compare previous winning numbers, study
          the {game.name} record, and check patterns from January to{" "}
          {MONTHS_FULL[curMonth]} {year}. Results for Gali, Desawar, Faridabad,
          Ghaziabad, Shree Ganesh and Delhi Bazar are all updated daily.
        </p>

        <h2 className="text-lg md:text-xl font-bold text-[#a5370c]">
          How to check {game.name} result?
        </h2>
        <p>
          Simply open this page around {game.time} and refresh — today&apos;s{" "}
          {game.name} number appears automatically in the result box above. No
          login or payment is required to view any Satta King result on
          SattaKing-Gali.
        </p>

        {/* Keyword pills — navigate to the homepage */}
        <div className="flex flex-wrap gap-2 pt-1">
          {SEO_KEYWORDS.map((kw) => (
            <Link
              key={kw}
              href="/#top"
              className="bg-gradient-to-b from-[#FFD93B] to-[#d4a017] text-[#3a1d00] font-bold text-[11px] md:text-xs px-3 py-1.5 rounded-full border border-[#e0850b] hover:brightness-105 transition-all"
            >
              {kw}
            </Link>
          ))}
        </div>

        <div className="bg-[#fff7e0] border border-[#f0e2a6] rounded-lg p-4 text-xs text-[#8a6d2f] mt-2">
          Disclaimer: This website is for informational purposes only. We do not
          promote or facilitate gambling, betting or Satta Matka in any form.
          Participation may be illegal in your region — please act responsibly.
        </div>

        <div className="text-center pt-1">
          <Link
            href="/"
            className="text-[#a5370c] hover:text-[#d97706] hover:underline text-sm font-bold"
          >
            &larr; Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
