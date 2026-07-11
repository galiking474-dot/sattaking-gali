"use client";

import { useState, useEffect, FormEvent } from "react";
import { getChartData, saveChartData } from "@/lib/firestore";
import { DEFAULT_GAMES, getMonthName } from "@/lib/utils";
import { ChartTable } from "@/components/charts/ChartTable";
import toast from "react-hot-toast";
import type { ChartHistory, ChartRecord } from "@/types";

export default function AdminChartsPage() {
  const [gameCode, setGameCode] = useState(DEFAULT_GAMES[0].gameCode);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [chart, setChart] = useState<ChartHistory | null>(null);
  const [loading, setLoading] = useState(false);

  // New record form
  const [recDate, setRecDate] = useState("");
  const [recResult, setRecResult] = useState("");
  const [recTime, setRecTime] = useState("");
  const [saving, setSaving] = useState(false);

  const gameName = DEFAULT_GAMES.find((g) => g.gameCode === gameCode)?.gameName || gameCode.toUpperCase();

  function loadChart() {
    setLoading(true);
    getChartData(gameCode, year, month)
      .then(setChart)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadChart();
  }, [gameCode, year, month]);

  async function handleAddRecord(e: FormEvent) {
    e.preventDefault();

    if (!/^\d{2}$/.test(recResult)) {
      toast.error("Result must be exactly 2 digits");
      return;
    }
    if (!recDate) {
      toast.error("Date is required");
      return;
    }

    const dayName = new Date(recDate + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
    });

    const newRecord: ChartRecord = {
      date: recDate,
      day: dayName,
      result: recResult,
      resultTime: recTime || DEFAULT_GAMES.find((g) => g.gameCode === gameCode)?.resultTime || "",
    };

    const existingRecords = chart?.records || [];
    const idx = existingRecords.findIndex((r) => r.date === recDate);
    const updatedRecords = [...existingRecords];
    if (idx >= 0) {
      updatedRecords[idx] = newRecord;
    } else {
      updatedRecords.push(newRecord);
    }
    updatedRecords.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setSaving(true);
    try {
      await saveChartData({
        gameCode,
        gameName,
        month,
        year,
        monthYear: `${year}-${String(month).padStart(2, "0")}`,
        records: updatedRecords,
      });
      toast.success("Chart record saved");
      setRecDate("");
      setRecResult("");
      setRecTime("");
      loadChart();
    } catch {
      toast.error("Failed to save record");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Charts</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Select Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Select Chart</h2>
            <div className="space-y-3">
              <select
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {DEFAULT_GAMES.map((g) => (
                  <option key={g.gameCode} value={g.gameCode}>
                    {g.gameName}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Add Record */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Add Record</h2>
            <form onSubmit={handleAddRecord} className="space-y-3">
              <input
                type="date"
                value={recDate}
                onChange={(e) => setRecDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
              <input
                type="text"
                value={recResult}
                onChange={(e) =>
                  setRecResult(e.target.value.replace(/\D/g, "").slice(0, 2))
                }
                placeholder="Result (2 digits)"
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                required
              />
              <input
                type="text"
                value={recTime}
                onChange={(e) => setRecTime(e.target.value)}
                placeholder="Time (e.g. 11:30 PM)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add / Update Record"}
              </button>
            </form>
          </div>
        </div>

        {/* Chart Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">
              {gameName} - {getMonthName(month)} {year}
            </h2>
            <p className="text-xs text-gray-400">
              {chart?.records?.length || 0} records
            </p>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : chart ? (
            <ChartTable records={chart.records} gameName={gameName} />
          ) : (
            <div className="p-8 text-center text-gray-500">
              No chart data. Add records using the form.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
