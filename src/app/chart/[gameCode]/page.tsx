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
        <div className="inline-flex items-center gap-2 bg-[#a5370c] text-[#FFE071] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <FiBarChart2 size={14} /> Record Chart
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#a5370c]">
          {gameName} Chart Record
        </h1>
        <p className="text-[#8a6d2f] text-sm mt-1">
          Monthly result history for {gameName}
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg bg-[#fdf3c4] text-[#a5370c] hover:bg-[#fce9a8] transition-colors"
          aria-label="Previous month"
        >
          <FiChevronLeft size={20} />
        </button>
        <div className="text-base md:text-lg font-extrabold text-[#3a1d00] min-w-[180px] md:min-w-[220px] text-center bg-gradient-to-r from-[#FFD93B] to-[#F5A623] rounded-lg py-2 px-3">
          {displayMonth || "…"} {displayYear}
        </div>
        <button
          onClick={() => navigateMonth(1)}
          disabled={isCurrentMonth}
          className="p-2 rounded-lg bg-[#fdf3c4] text-[#a5370c] hover:bg-[#fce9a8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border-2 border-[#e0850b] py-14 text-center text-[#b09a5a] font-medium">
          Loading chart&hellip;
        </div>
      ) : hasGameChart ? (
        /* ── Per-game monthly record ── */
        <div className="bg-white rounded-xl border-2 border-[#e0850b] overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-[#FFD93B] to-[#F5A623] text-[#a5370c] text-center py-2.5 font-bold border-b-2 border-[#e0850b]">
            {gameName} &mdash; {displayMonth} {displayYear}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base border-collapse">
              <thead>
                <tr className="bg-[#a5370c] text-[#FFE071] uppercase text-xs md:text-sm">
                  <th className="py-2.5 px-3 text-left font-bold border border-[#c2600f]">Date</th>
                  <th className="py-2.5 px-3 text-left font-bold border border-[#c2600f]">Day</th>
                  <th className="py-2.5 px-3 text-center font-bold border border-[#c2600f]">Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.date + i} className={i % 2 === 0 ? "bg-white" : "bg-[#fffbe9]"}>
                    <td className="py-2.5 px-3 font-bold text-[#a5370c] border border-[#f0e2a6]">{row.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-600 border border-[#f0e2a6]">{row.day}</td>
                    <td className="py-2.5 px-3 text-center border border-[#f0e2a6]">
                      <span className={`inline-block min-w-[46px] py-1 px-3 rounded-lg font-extrabold font-mono text-lg ${
                        row.result === "XX" || !row.result
                          ? "text-gray-400"
                          : "bg-[#F6D68A] text-[#dc2626]"
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
        <Link href="/" className="text-[#a5370c] hover:text-[#d97706] hover:underline text-sm font-bold">
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
      <div className="bg-white rounded-xl border-2 border-[#e0850b] py-14 text-center text-[#8a6d2f] font-medium px-4">
        No chart data available for {month} {year}.
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border-2 border-[#e0850b] overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-[#FFD93B] to-[#F5A623] text-[#a5370c] text-center py-2.5 font-bold border-b-2 border-[#e0850b] text-sm md:text-base">
        Satta King Combined Chart &mdash; {month} {year}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-[15px] sm:text-xs md:text-base border-collapse">
          <thead>
            <tr className="bg-[#a5370c] text-[#FFE071] uppercase text-[13px] md:text-sm tracking-wide">
              <th className="py-2 px-0.5 md:px-3 font-bold border border-[#c2600f]">DATE</th>
              {COLS.map((c) => (
                <th key={c.key} className="py-2 px-0.5 md:px-3 font-bold border border-[#c2600f]">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.date + i} className={`text-center ${i % 2 === 0 ? "bg-white" : "bg-[#fffbe9]"}`}>
                <td className="py-1.5 px-0.5 md:px-3 font-bold text-[#dc2626] border border-[#f0e2a6]">{row.date}</td>
                {COLS.map((c) => (
                  <td key={c.key} className="py-1.5 px-0.5 md:px-3 font-mono font-bold text-[#1e293b] border border-[#f0e2a6]">
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
