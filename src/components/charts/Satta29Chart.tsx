"use client";

import { useState } from "react";
import type { Satta29Row } from "@/lib/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// satta29.com publishes records back to 2005.
const START_YEAR = 2005;

function weekday(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function dayNum(iso: string): string {
  const parts = iso.split("-");
  return parts[2] || iso;
}

export function Satta29Chart({
  month: initialMonth,
  year: initialYear,
  games: initialGames,
  rows: initialRows,
}: {
  month: string;
  year: string;
  games: string[];
  rows: Satta29Row[];
}) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [games, setGames] = useState(initialGames);
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let y = currentYear; y >= START_YEAR; y--) years.push(String(y));

  // Split the games into groups of 3 so each renders as its own table that
  // fits a phone screen without horizontal scrolling.
  const groups: string[][] = [];
  for (let i = 0; i < games.length; i += 3) groups.push(games.slice(i, i + 3));

  async function load(nextMonth: string, nextYear: string) {
    setLoading(true);
    setMonth(nextMonth);
    setYear(nextYear);
    try {
      const res = await fetch(
        `/api/satta29-chart?month=${nextMonth.toLowerCase()}&year=${nextYear}`
      );
      const data = await res.json();
      if (data.success) {
        setGames(data.games || []);
        setRows(data.rows || []);
      } else {
        setGames([]);
        setRows([]);
      }
    } catch {
      setGames([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Month + Year filter */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <select
          value={month}
          onChange={(e) => load(e.target.value, year)}
          disabled={loading}
          className="rounded-xl border-2 border-[#e0850b] bg-white px-4 py-2.5 text-sm md:text-base font-bold text-[#3a1d00] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] disabled:opacity-50"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => load(month, e.target.value)}
          disabled={loading}
          className="rounded-xl border-2 border-[#e0850b] bg-white px-4 py-2.5 text-sm md:text-base font-bold text-[#3a1d00] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] disabled:opacity-50"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Chart tables — one per group of 3 games */}
      {loading ? (
        <div className="bg-white rounded-xl border-2 border-[#e0850b] overflow-hidden shadow-lg p-4 space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton h-6 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-[#e0850b] shadow-lg text-center py-10 text-[#7a5a1a] font-semibold">
          No chart records available for {month} {year}.
        </div>
      ) : (
        <div className="space-y-5 md:space-y-6">
          {groups.map((groupGames, gi) => (
            <div
              key={gi}
              className="bg-white rounded-xl border-2 border-[#e0850b] overflow-hidden shadow-lg"
            >
              <div className="bg-gradient-to-r from-[#FFD93B] to-[#F5A623] text-[#a5370c] text-center py-2.5 md:py-3 text-[14px] md:text-base font-bold px-2 md:px-3 border-b-2 border-[#e0850b]">
                Satta King Chart {month} {year}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-[13px] sm:text-sm md:text-base border-collapse">
                  <thead>
                    <tr className="bg-[#a5370c] text-[#FFE071] uppercase tracking-wider">
                      <th className="py-2.5 px-2 md:px-3 font-bold border border-[#c2600f] w-[22%]">
                        Date
                      </th>
                      {groupGames.map((g) => (
                        <th
                          key={g}
                          className="py-2.5 px-2 md:px-3 font-bold border border-[#c2600f]"
                        >
                          {g}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={row.date}
                        className={`text-center transition-colors hover:bg-[#fdf2c9] ${
                          i % 2 === 0 ? "bg-white" : "bg-[#fffbe9]"
                        }`}
                      >
                        <td className="py-1.5 px-2 md:px-3 text-[#dc2626] font-extrabold border border-[#f0e2a6]">
                          <span className="tabular-nums">{dayNum(row.date)}</span>
                          <span className="ml-1 text-[10px] font-semibold text-[#9a7b2a] uppercase">
                            {weekday(row.date)}
                          </span>
                        </td>
                        {groupGames.map((g) => (
                          <td
                            key={g}
                            className="py-1.5 px-2 md:px-3 font-mono font-bold text-[#1e293b] border border-[#f0e2a6]"
                          >
                            {row.values[g] ? row.values[g] : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
