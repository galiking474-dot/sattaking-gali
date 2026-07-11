"use client";

import type { GameResult } from "@/types";
import { cn } from "@/lib/utils";

export function LiveResultCard({ game }: { game: GameResult }) {
  const isDeclared = game.status === "declared";

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-5 text-center transition-all",
        isDeclared
          ? "border-emerald-500 bg-emerald-50 shadow-md"
          : "border-amber-400 bg-amber-50 animate-pulse-border"
      )}
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
        {game.gameName}
      </h3>
      <div
        className={cn(
          "text-4xl font-extrabold font-mono my-3",
          isDeclared ? "text-emerald-700" : "text-amber-600"
        )}
      >
        {isDeclared ? game.result : "---"}
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <span>{game.resultTime}</span>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            isDeclared
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          )}
        >
          {isDeclared ? "Declared" : "Pending"}
        </span>
      </div>
    </div>
  );
}
