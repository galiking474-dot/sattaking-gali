import Link from "next/link";
import type { ArchiveGame } from "@/lib/archive-games";
import { ARCHIVE_YEARS, getArchivePath } from "@/lib/archive-games";
import type { MonthlyChartData } from "@/lib/types";
import { SITE_URL } from "@/lib/site";
import { ChartPageInformation } from "@/components/charts/ChartPageInformation";
import { getYearlyPageContent } from "@/lib/chart-page-content";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

function cleanResult(value: string | undefined): string {
  const result = value?.trim() ?? "";
  return !result || result === "--" || result.toUpperCase() === "XX"
    ? "-"
    : result;
}

function parseDay(value: string): number {
  const isoMatch = value.match(/^\d{4}-\d{2}-(\d{1,2})$/);
  if (isoMatch) return Number(isoMatch[1]);
  return Number(value.match(/^\d{1,2}/)?.[0]);
}

export function YearlyArchive({
  game,
  year,
  charts,
  archiveRecords,
}: {
  game: ArchiveGame;
  year: number;
  charts: Array<MonthlyChartData | null>;
  archiveRecords: Array<Array<{ date: string; result: string }>>;
}) {
  const pageContent = getYearlyPageContent(game.slug, year);
  const values = charts.map((chart, monthIndex) => {
    const monthValues = new Map<number, string>();
    for (const row of chart?.results ?? []) {
      const day = parseDay(row.date);
      if (day >= 1 && day <= 31) {
        monthValues.set(day, cleanResult(row[game.chartKey]));
      }
    }
    for (const record of archiveRecords[monthIndex] ?? []) {
      const day = parseDay(record.date);
      if (day >= 1 && day <= 31) {
        monthValues.set(day, cleanResult(record.result));
      }
    }
    return monthValues;
  });

  const recordCount = values.reduce(
    (count, month) =>
      count + [...month.values()].filter((result) => result !== "-").length,
    0
  );
  const pageUrl = `${SITE_URL}/${game.slug}-yearly-chart-${year}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        name: `${game.name} Satta Result Chart ${year}`,
        description: `Month-by-month ${game.name} result records for ${year}.`,
        url: pageUrl,
        temporalCoverage: `${year}-01-01/${year}-12-31`,
        isAccessibleForFree: true,
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Charts", item: `${SITE_URL}/charts` },
          { "@type": "ListItem", position: 3, name: `${game.name} ${year}`, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 py-5 md:py-8 space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-[#7a5a1a]">
        <Link className="font-bold hover:underline" href="/">
          Home
        </Link>{" "}
        /{" "}
        <Link className="font-bold hover:underline" href="/charts">
          Charts
        </Link>{" "}
        / {game.name} {year}
      </nav>

      <header className="rounded-2xl border-2 border-[#e0850b] bg-gradient-to-b from-[#FFF7DA] to-[#FCE38A] px-4 py-6 text-center shadow-lg md:px-8 md:py-9">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#a5370c]">
          Complete yearly result archive
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-[#3a1d00] md:text-4xl">
          {pageContent?.title ?? `${game.name} Satta Result Chart ${year}`}
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm font-medium leading-6 text-[#70501a] md:text-base">
          Month-by-month {game.name} result records for {year}. Only available
          records stored in the site&apos;s Firebase-backed chart archive are shown;
          a dash means no result is available.
        </p>
        <p className="mt-3 text-xs font-bold text-[#8a6d2f]">
          {recordCount} archived result{recordCount === 1 ? "" : "s"}
        </p>
      </header>

      <section
        aria-labelledby="yearly-record-heading"
        className="overflow-hidden rounded-xl border-2 border-[#e0850b] bg-white shadow-lg"
      >
        <h2
          id="yearly-record-heading"
          className="bg-gradient-to-r from-[#FFD93B] to-[#F5A623] px-3 py-3 text-center text-base font-extrabold text-[#a5370c] md:text-xl"
        >
          {game.name} Monthly Record — {year}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-center text-sm">
            <thead>
              <tr className="bg-[#a5370c] text-[#FFE071]">
                <th className="sticky left-0 z-10 border border-[#c2600f] bg-[#a5370c] px-2 py-2.5 font-extrabold">
                  DATE
                </th>
                {MONTHS.map((month) => (
                  <th
                    key={month}
                    className="border border-[#c2600f] px-2 py-2.5 font-extrabold"
                  >
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 31 }, (_, index) => index + 1).map(
                (day, rowIndex) => (
                  <tr
                    key={day}
                    className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#fffbe9]"}
                  >
                    <th className="sticky left-0 border border-[#f0e2a6] bg-inherit px-2 py-2 font-extrabold text-[#dc2626]">
                      {day}
                    </th>
                    {MONTHS.map((month, monthIndex) => {
                      const result = values[monthIndex]?.get(day) ?? "-";
                      return (
                        <td
                          key={month}
                          className={`border border-[#f0e2a6] px-2 py-2 font-mono font-bold ${
                            result === "-" ? "text-[#b09a5a]" : "text-[#1e293b]"
                          }`}
                        >
                          {result}
                        </td>
                      );
                    })}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="other-years-heading" className="rounded-xl border border-[#f0e2a6] bg-white p-4 shadow-sm">
        <h2 id="other-years-heading" className="text-center text-lg font-extrabold text-[#a5370c]">
          Other {game.name} Record Years
        </h2>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {ARCHIVE_YEARS.map((archiveYear) => (
            <Link
              key={archiveYear}
              href={getArchivePath(game.slug, archiveYear)}
              aria-current={archiveYear === year ? "page" : undefined}
              className={`min-h-11 min-w-16 rounded-lg border px-3 py-2.5 text-center text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5370c] ${
                archiveYear === year
                  ? "border-[#a5370c] bg-[#a5370c] text-[#FFE071]"
                  : "border-[#e0850b] bg-[#fff7e0] text-[#a5370c] hover:bg-[#FCE38A]"
              }`}
            >
              {archiveYear}
            </Link>
          ))}
        </div>
      </section>

      {pageContent && <ChartPageInformation content={pageContent} />}
    </div>
  );
}
