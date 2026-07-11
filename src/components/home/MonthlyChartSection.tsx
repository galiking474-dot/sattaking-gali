"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FiBarChart2 } from "react-icons/fi";
import type { ChartRow } from "@/lib/types";

export function MonthlyChartSection({
  month: initialMonth,
  year: initialYear,
  rows: initialRows,
}: {
  month: string;
  year: string;
  rows: ChartRow[];
}) {
  const [currentDate, setCurrentDate] = useState(
    new Date(Number(initialYear), new Date(`${initialMonth} 1, ${initialYear}`).getMonth())
  );
  const [rows, setRows] = useState(initialRows);
  const [chartLoading, setChartLoading] = useState(false);

  const displayMonth = format(currentDate, "MMMM");
  const displayYear = format(currentDate, "yyyy");

  const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
  const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);

  const fetchMonth = async (date: Date) => {
    setChartLoading(true);
    const m = format(date, "MMMM").toLowerCase();
    const y = format(date, "yyyy");
    try {
      const res = await fetch(`/api/monthly-chart?month=${m}&year=${y}`);
      const data = await res.json();
      if (data.success) {
        setRows(data.results || []);
        setCurrentDate(date);
      }
    } catch (err) {
      console.error("Chart fetch error:", err);
    } finally {
      setChartLoading(false);
    }
  };

  const cols: { key: keyof ChartRow; label: string }[] = [
    { key: "dlbz", label: "DLBZ" },
    { key: "srgn", label: "SRGN" },
    { key: "frbd", label: "FRBD" },
    { key: "gzbd", label: "GZBD" },
    { key: "gali", label: "GALI" },
    { key: "dswr", label: "DSWR" },
  ];

  return (
    <div className="">
      <div className="flex items-center gap-2.5 md:gap-3 mb-3">
        <div className="p-2 rounded-lg bg-[#d97706] text-white shrink-0">
          <FiBarChart2 size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl md:text-lg font-extrabold text-[#a5370c]">Monthly Chart {displayYear}</h2>
          <p className="text-[14px] md:text-xs text-[#8a6d2f] truncate">
            {displayMonth} {displayYear} &mdash; Gali, Desawar, Ghaziabad, Faridabad &amp; more
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#e0850b] overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-[#FFD93B] to-[#F5A623] text-[#a5370c] text-center py-2.5 md:py-3 text-[14px] md:text-sm font-bold px-2 md:px-3 leading-relaxed border-b-2 border-[#e0850b]">
          Satta King Chart {displayMonth} {displayYear} <span className="hidden sm:inline">&mdash; Faridabad, Ghaziabad, Gali, Shri Ganesh, Delhi Bazar &amp; Desawar</span>
        </div>

        {chartLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="skeleton h-5 w-10" />
                {cols.map((c) => (
                  <div key={c.key} className="skeleton h-5 flex-1" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-[18px] sm:text-xs md:text-base border-collapse">
              <thead>
                <tr className="bg-[#a5370c] text-[#FFE071] text-[14px] md:text-sm uppercase tracking-wider">
                  <th className="py-2.5 px-0.5 md:px-3 text-[#FFE071] font-bold border border-[#c2600f]">DATE</th>
                  {cols.map((c) => (
                    <th key={c.key} className="py-2.5 px-0.5 md:px-3 font-bold border border-[#c2600f]">{c.label}</th>
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
                    <td className="py-1.5 px-0.5 md:px-3 text-[#dc2626] font-extrabold border border-[#f0e2a6]">{row.date}</td>
                    {cols.map((c) => (
                      <td key={c.key} className="py-1.5 px-0.5 md:px-3 font-mono font-bold text-[#1e293b] border border-[#f0e2a6]">{row[c.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <button
          onClick={() => fetchMonth(prevDate)}
          disabled={chartLoading}
          className="bg-gradient-to-b from-[#FFD93B] to-[#d4a017] text-[#3a1d00] text-center py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-extrabold border-2 border-[#e0850b] hover:brightness-105 transition-all disabled:opacity-50"
        >
          &larr; {format(prevDate, "MMM yyyy")}
        </button>
        <button
          onClick={() => fetchMonth(nextDate)}
          disabled={chartLoading}
          className="bg-gradient-to-b from-[#FFD93B] to-[#d4a017] text-[#3a1d00] text-center py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-extrabold border-2 border-[#e0850b] hover:brightness-105 transition-all disabled:opacity-50"
        >
          {format(nextDate, "MMM yyyy")} &rarr;
        </button>
      </div>
    </div>
  );
}
