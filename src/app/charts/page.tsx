import type { Metadata } from "next";
import Link from "next/link";
import { getSatta29Chart } from "@/lib/api-helpers";
import { Satta29Chart } from "@/components/charts/Satta29Chart";
import { PreviousYearCharts } from "@/components/home/PreviousYearCharts";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `Satta King Chart Records ${year}`,
        url: `${SITE_URL}/charts`,
        description: metadata.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Charts", item: `${SITE_URL}/charts` },
        ],
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-6 py-6 md:py-8">
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-[#7a5a1a]">
        <Link href="/" className="font-bold hover:underline">Home</Link>
        <span aria-hidden="true"> / </span>
        <span>Charts</span>
      </nav>
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

      <article className="mt-8 rounded-xl border border-[#f0e2a6] bg-white p-5 text-gray-700 shadow-sm md:p-8">
        <h2 className="text-xl font-extrabold text-[#a5370c] md:text-2xl">
          How to read the result charts
        </h2>
        <p className="mt-3 leading-relaxed">
          Each row represents a calendar date and each market has its own column.
          A number is shown only when a record is available. A blank cell or dash
          means the site does not currently have a stored value for that date; it
          should not be read as a result.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <section>
            <h3 className="font-bold text-[#3a1d00]">Monthly records</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Use the month controls to review daily entries for the selected
              period. Market abbreviations stay in the same column so records can
              be scanned consistently across the month.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-[#3a1d00]">Yearly archives</h3>
            <p className="mt-2 text-sm leading-relaxed">
              The archive links group twelve months for one market and year. Past
              records are reference data only and cannot predict a future result.
            </p>
          </section>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/result-timings" className="inline-flex min-h-11 items-center rounded-lg bg-[#a5370c] px-4 py-2 font-bold text-white hover:bg-[#7f2b0a]">
            Check result timings
          </Link>
          <Link href="/blog" className="inline-flex min-h-11 items-center rounded-lg border border-[#e0850b] bg-[#fff7e0] px-4 py-2 font-bold text-[#a5370c] hover:bg-[#FCE38A]">
            Read chart guides
          </Link>
        </div>
      </article>
    </div>
  );
}
