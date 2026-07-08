import Link from "next/link";
import { DEFAULT_GAMES } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart Records - All Games",
  description:
    "View historical chart records for Gali, Desawar, Ghaziabad, Faridabad and more games.",
};

export default function ChartsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5f] text-center mb-8">
        Chart Records
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Select a game to view its monthly chart records.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEFAULT_GAMES.map((game) => (
          <Link
            key={game.gameCode}
            href={`/chart/${game.gameCode}`}
            className="group block bg-white rounded-xl border-2 border-gray-200 p-6 text-center hover:border-[#1e3a5f] hover:shadow-lg transition-all"
          >
            <h2 className="text-lg font-bold text-[#1e3a5f] group-hover:text-blue-600 mb-2">
              {game.gameName}
            </h2>
            <p className="text-sm text-gray-500">Result Time: {game.resultTime}</p>
            <div className="mt-4 text-sm font-medium text-blue-600 group-hover:underline">
              View Chart &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
