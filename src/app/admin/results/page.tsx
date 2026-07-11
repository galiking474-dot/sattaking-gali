"use client";

import { useState, FormEvent } from "react";
import { updateDailyResult } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { useLiveResults } from "@/hooks/useLiveResults";
import { getTodayDateString, DEFAULT_GAMES } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import type { GameResult } from "@/types";

export default function AdminResultsPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(getTodayDateString());
  const { results, loading } = useLiveResults(date);
  const [selectedGame, setSelectedGame] = useState(DEFAULT_GAMES[0].gameCode);
  const [resultValue, setResultValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!/^\d{2}$/.test(resultValue)) {
      toast.error("Result must be exactly 2 digits (00-99)");
      return;
    }

    const game = DEFAULT_GAMES.find((g) => g.gameCode === selectedGame);
    if (!game) return;

    setSubmitting(true);
    try {
      const gameResult: GameResult = {
        gameName: game.gameName,
        gameCode: game.gameCode,
        result: resultValue,
        resultTime: game.resultTime,
        status: "declared",
        declaredAt: Timestamp.now(),
      };
      await updateDailyResult(date, gameResult, user?.uid || "");
      toast.success(`${game.gameName} result updated to ${resultValue}`);
      setResultValue("");
    } catch {
      toast.error("Failed to update result");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Results</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add/Update Result Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Add / Update Result
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="game" className="block text-sm font-medium text-gray-700 mb-1">
                Game
              </label>
              <select
                id="game"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {DEFAULT_GAMES.map((g) => (
                  <option key={g.gameCode} value={g.gameCode}>
                    {g.gameName} ({g.resultTime})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="result" className="block text-sm font-medium text-gray-700 mb-1">
                Result (2 digits)
              </label>
              <input
                id="result"
                type="text"
                value={resultValue}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setResultValue(v);
                }}
                placeholder="e.g. 45"
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Declare Result"}
            </button>
          </form>
        </div>

        {/* Current Results for Selected Date */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Results for {date}
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-3">
              {DEFAULT_GAMES.map((game) => {
                const r = results?.results?.find(
                  (res) => res.gameCode === game.gameCode
                );
                return (
                  <div
                    key={game.gameCode}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        {game.gameName}
                      </p>
                      <p className="text-xs text-gray-400">{game.resultTime}</p>
                    </div>
                    <div>
                      {r?.status === "declared" ? (
                        <span className="text-xl font-mono font-bold text-emerald-600">
                          {r.result}
                        </span>
                      ) : (
                        <span className="text-sm text-amber-500 font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
