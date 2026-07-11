"use client";

import { useEffect, useState } from "react";
import { getTodayResults, getContactMessages } from "@/lib/firestore";
import { getTodayDateString, DEFAULT_GAMES } from "@/lib/utils";
import { FiList, FiBell, FiMail, FiBarChart2 } from "react-icons/fi";
import type { DailyResult, ContactMessage } from "@/types";

export default function AdminDashboardPage() {
  const [todayResults, setTodayResults] = useState<DailyResult | null>(null);
  const [messages, setMessages] = useState<(ContactMessage & { id: string })[]>([]);

  useEffect(() => {
    const today = getTodayDateString();
    getTodayResults(today).then(setTodayResults);
    getContactMessages().then(setMessages);
  }, []);

  const declaredCount =
    todayResults?.results?.filter((r) => r.status === "declared").length || 0;
  const totalGames = DEFAULT_GAMES.length;
  const unreadMessages = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FiList size={24} />}
          label="Today's Results"
          value={`${declaredCount}/${totalGames}`}
          sublabel="declared"
          color="blue"
        />
        <StatCard
          icon={<FiBarChart2 size={24} />}
          label="Total Games"
          value={String(totalGames)}
          sublabel="active"
          color="green"
        />
        <StatCard
          icon={<FiMail size={24} />}
          label="Unread Messages"
          value={String(unreadMessages)}
          sublabel="pending"
          color="amber"
        />
        <StatCard
          icon={<FiBell size={24} />}
          label="Notifications"
          value="--"
          sublabel="sent today"
          color="purple"
        />
      </div>

      {/* Today's Results Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Today&apos;s Results Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DEFAULT_GAMES.map((game) => {
            const result = todayResults?.results?.find(
              (r) => r.gameCode === game.gameCode
            );
            return (
              <div
                key={game.gameCode}
                className="border border-gray-200 rounded-lg p-4 text-center"
              >
                <p className="text-xs font-bold uppercase text-gray-500 mb-1">
                  {game.gameName}
                </p>
                <p className="text-2xl font-mono font-bold">
                  {result?.status === "declared" ? (
                    <span className="text-emerald-600">{result.result}</span>
                  ) : (
                    <span className="text-gray-300">--</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">{game.resultTime}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  color: "blue" | "green" | "amber" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
    </div>
  );
}
