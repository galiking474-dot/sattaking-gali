"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiBarChart2 } from "react-icons/fi";
import type { ChartRow } from "@/lib/types";

interface GameChartRow {
  date: string;
  day: string;
  result: string;
}

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export default function GameChartPage({
  params,
}: {
  params: Promise<{ gameCode: string }>;
}) {
  const { gameCode } = use(params);
  const gameName = gameCode.replace(/-/g, " ").toUpperCase();

  const [rows, setRows] = useState<GameChartRow[]>([]);
  const [monthlyRows, setMonthlyRows] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayMonth, setDisplayMonth] = useState("");
  const [displayYear, setDisplayYear] = useState("");

  const now = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(now.getFullYear(), now.getMonth())
  );

  useEffect(() => {
    const fetchChart = async (date: Date) => {
      setLoading(true);
      const m = MONTHS[date.getMonth()];
      const y = String(date.getFullYear());
      setDisplayMonth(m.charAt(0).toUpperCase() + m.slice(1));
      setDisplayYear(y);

      // Fetch per-game chart and the combined monthly chart together. If the
      // per-game record isn't available (e.g. a resultsatta-only game), we still
      // show the combined monthly chart so the page is never empty.
      try {
        const [gameRes, monthlyRes] = await Promise.all([
          fetch(`/api/game-chart?slug=${gameCode}&month=${m}&year=${y}`),
          fetch(`/api/monthly-chart?month=${m}&year=${y}`),
        ]);
        const gameData = await gameRes.json().catch(() => ({ success: false }));
        const monthlyData = await monthlyRes.json().catch(() => ({ success: false }));

        setRows(gameData.success ? gameData.results || [] : []);
        setMonthlyRows(monthlyData.success ? monthlyData.results || [] : []);
        if (gameData.success && gameData.month) {
          setDisplayMonth(gameData.month);
          setDisplayYear(gameData.year || y);
        }
      } catch {
        setRows([]);
        setMonthlyRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChart(currentDate);
  }, [gameCode, currentDate]);

  const navigateMonth = (dir: -1 | 1) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + dir));
  };

  const isCurrentMonth =
    currentDate.getFullYear() === now.getFullYear() &&
    currentDate.getMonth() === now.getMonth();

  const hasGameChart = rows.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-8">
      {/* Title */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 bg-[#2e1065] text-[#f5b301] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <FiBarChart2 size={14} /> Record Chart
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#2e1065]">
          {gameName} Chart Record
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Monthly result history for {gameName}
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg bg-[#ede7f8] text-[#4c1d95] hover:bg-[#dccdf5] transition-colors"
          aria-label="Previous month"
        >
          <FiChevronLeft size={20} />
        </button>
        <div className="text-base md:text-lg font-extrabold text-[#2e1065] min-w-[180px] md:min-w-[220px] text-center bg-gradient-to-r from-[#f5b301] to-[#d4a017] rounded-lg py-2 px-3">
          {displayMonth || "…"} {displayYear}
        </div>
        <button
          onClick={() => navigateMonth(1)}
          disabled={isCurrentMonth}
          className="p-2 rounded-lg bg-[#ede7f8] text-[#4c1d95] hover:bg-[#dccdf5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border-2 border-[#4c1d95] py-14 text-center text-gray-400 font-medium">
          Loading chart&hellip;
        </div>
      ) : hasGameChart ? (
        /* ── Per-game monthly record ── */
        <div className="bg-white rounded-xl border-2 border-[#4c1d95] overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-[#4c1d95] to-[#6d28d9] text-white text-center py-2.5 font-bold border-b-2 border-[#f5b301]">
            {gameName} &mdash; {displayMonth} {displayYear}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base border-collapse">
              <thead>
                <tr className="bg-[#2e1065] text-[#f5d67a] uppercase text-xs md:text-sm">
                  <th className="py-2.5 px-3 text-left font-bold border border-[#5b21b6]">Date</th>
                  <th className="py-2.5 px-3 text-left font-bold border border-[#5b21b6]">Day</th>
                  <th className="py-2.5 px-3 text-center font-bold border border-[#5b21b6]">Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.date + i} className={i % 2 === 0 ? "bg-white" : "bg-[#f6f2fd]"}>
                    <td className="py-2.5 px-3 font-bold text-[#2e1065] border border-[#e6def7]">{row.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-600 border border-[#e6def7]">{row.day}</td>
                    <td className="py-2.5 px-3 text-center border border-[#e6def7]">
                      <span className={`inline-block min-w-[46px] py-1 px-3 rounded-lg font-extrabold font-mono text-lg ${
                        row.result === "XX" || !row.result
                          ? "text-gray-400"
                          : "bg-[#f5b301]/20 text-[#c2410c]"
                      }`}>
                        {row.result || "XX"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Fallback: combined monthly chart ── */
        <MonthlyFallback rows={monthlyRows} month={displayMonth} year={displayYear} />
      )}

      {/* Back link */}
      <div className="text-center mt-6">
        <Link href="/" className="text-[#7c3aed] hover:text-[#4c1d95] hover:underline text-sm font-bold">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

// ─── Combined monthly chart (shown when a per-game record isn't available) ───

const COLS: { key: keyof ChartRow; label: string }[] = [
  { key: "dlbz", label: "DLBZ" },
  { key: "srgn", label: "SRGN" },
  { key: "frbd", label: "FRBD" },
  { key: "gzbd", label: "GZBD" },
  { key: "gali", label: "GALI" },
  { key: "dswr", label: "DSWR" },
];

function MonthlyFallback({ rows, month, year }: { rows: ChartRow[]; month: string; year: string }) {
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-[#4c1d95] py-14 text-center text-gray-500 font-medium px-4">
        No chart data available for {month} {year}.
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border-2 border-[#4c1d95] overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-[#4c1d95] to-[#6d28d9] text-white text-center py-2.5 font-bold border-b-2 border-[#f5b301] text-sm md:text-base">
        Satta King Combined Chart &mdash; {month} {year}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-[15px] sm:text-xs md:text-base border-collapse">
          <thead>
            <tr className="bg-[#2e1065] text-[#f5d67a] uppercase text-[13px] md:text-sm tracking-wide">
              <th className="py-2 px-0.5 md:px-3 font-bold border border-[#5b21b6]">DATE</th>
              {COLS.map((c) => (
                <th key={c.key} className="py-2 px-0.5 md:px-3 font-bold border border-[#5b21b6]">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.date + i} className={`text-center ${i % 2 === 0 ? "bg-white" : "bg-[#f6f2fd]"}`}>
                <td className="py-1.5 px-0.5 md:px-3 font-bold text-[#c2410c] border border-[#e6def7]">{row.date}</td>
                {COLS.map((c) => (
                  <td key={c.key} className="py-1.5 px-0.5 md:px-3 font-mono font-bold text-[#2e1065] border border-[#e6def7]">
                    {row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
