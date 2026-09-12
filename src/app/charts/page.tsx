import type { Metadata } from "next";
import { getSatta29Chart } from "@/lib/api-helpers";
import { Satta29Chart } from "@/components/charts/Satta29Chart";
import { PreviousYearCharts } from "@/components/home/PreviousYearCharts";

export const metadata: Metadata = {
  title: "Satta King Chart 2015 to 2026 — Monthly & Yearly Records",
  description:
    "Browse Satta King result charts from 2015 to 2026 for Gali, Desawar, Faridabad, Ghaziabad, Delhi Bazar and Shri Ganesh, with monthly and yearly records.",
  alternates: { canonical: "/charts" },
  openGraph: {
    title: "Satta King Chart 2015 to 2026",
    description: "Monthly and yearly Satta King result record charts from 2015 to 2026.",
    url: "/charts",
    type: "website",
  },
};

// Scrape at request time — chart updates through the day.
export const dynamic = "force-dynamic";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function ChartsPage() {
  const now = new Date();
  const month = MONTHS[now.getMonth()];
  const year = String(now.getFullYear());

  const chart = await getSatta29Chart(month, year);

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-6 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#a5370c] text-center mb-2">
        Satta King Chart Records
      </h1>
      <p className="text-center text-[#7a5a1a] font-medium mb-6 md:mb-8 text-sm md:text-base">
        Select a month and year to view the full result chart.
      </p>

      <Satta29Chart
        month={chart?.month ?? month}
        year={chart?.year ?? year}
        games={chart?.games ?? []}
        rows={chart?.rows ?? []}
      />

      <div className="mt-8">
        <PreviousYearCharts />
      </div>
    </div>
  );
}
