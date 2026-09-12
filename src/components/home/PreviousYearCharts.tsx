import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import {
  ARCHIVE_GAMES,
  ARCHIVE_YEARS,
  HISTORICAL_END_YEAR,
  HISTORICAL_START_YEAR,
  getArchivePath,
} from "@/lib/archive-games";

export function PreviousYearCharts() {
  return (
    <section
      aria-labelledby="old-record-charts-heading"
      className="overflow-hidden rounded-2xl border-2 border-[#e0850b] bg-white shadow-lg"
    >
      <header className="border-b-2 border-[#e0850b] bg-gradient-to-r from-[#FFD93B] to-[#F5A623] px-4 py-5 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#a5370c]">
          Yearly result data
        </p>
        <h2
          id="old-record-charts-heading"
          className="mt-1 text-xl font-extrabold text-[#3a1d00] md:text-2xl"
        >
          Satta King Previous Year Result Charts
        </h2>
        <p className="mt-2 text-sm font-semibold text-[#70501a]">
          {HISTORICAL_START_YEAR} to {HISTORICAL_END_YEAR} &middot; Select a
          market to view all years
        </p>
      </header>

      <div className="space-y-3 bg-[#FFFDF3] p-3 sm:p-4">
        {ARCHIVE_GAMES.map((game) => (
          <details
            key={game.slug}
            name="previous-year-market"
            className="group overflow-hidden rounded-xl border border-[#e0850b] bg-white shadow-sm"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[#6b3108] transition-colors hover:bg-[#FFF4C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a5370c] [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-sm font-extrabold uppercase sm:text-base">
                  {game.name} Result Charts
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-[#8a6d2f]">
                  {ARCHIVE_YEARS.length} yearly charts &middot;{" "}
                  {HISTORICAL_START_YEAR}&ndash;{HISTORICAL_END_YEAR}
                </span>
              </span>
              <FiChevronDown
                aria-hidden="true"
                className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>

            <div
              className="grid grid-cols-2 gap-2 border-t border-[#f0d98a] bg-[#FFFDF3] p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
              aria-label={`${game.name} result charts from ${HISTORICAL_START_YEAR} to ${HISTORICAL_END_YEAR}`}
            >
              {ARCHIVE_YEARS.map((year) => (
                <Link
                  key={year}
                  href={getArchivePath(game.slug, year)}
                  aria-label={`Open ${game.name} result chart for ${year}`}
                  className="flex min-h-12 items-center justify-center rounded-lg border border-[#e0850b] bg-white px-2 py-3 text-center text-xs font-bold uppercase leading-5 text-[#6b3108] transition-colors hover:bg-[#FCE38A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5370c] sm:text-sm"
                >
                  {year} Result Chart
                </Link>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
