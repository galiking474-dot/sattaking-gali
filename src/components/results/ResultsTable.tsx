"use client";

import { useEffect, useState } from "react";
import { getRecentResults } from "@/lib/firestore";
import { formatShortDate } from "@/lib/utils";
import { DEFAULT_GAMES } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/Loading";
import type { DailyResult } from "@/types";

export function ResultsTable() {
  const [results, setResults] = useState<(DailyResult & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentResults(10)
      .then((data) => setResults(data.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <TableSkeleton rows={7} />;

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No results available yet.
      </div>
    );
  }

  const games = DEFAULT_GAMES;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#1e3a5f] text-white">
            <th className="px-3 py-3 text-left font-semibold">Date</th>
            {games.map((g) => (
              <th key={g.gameCode} className="px-3 py-3 text-center font-semibold">
                {g.gameName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((day, idx) => (
            <tr
              key={day.id}
              className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                {formatShortDate(day.date)}
              </td>
              {games.map((g) => {
                const result = day.results?.find(
                  (r) => r.gameCode === g.gameCode
                );
                return (
                  <td
                    key={g.gameCode}
                    className="px-3 py-2.5 text-center font-mono font-bold"
                  >
                    {result?.status === "declared" ? (
                      <span className="text-emerald-700">{result.result}</span>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
