import type { Metadata } from "next";
import Link from "next/link";
import { FiClock, FiBarChart2, FiInfo } from "react-icons/fi";
import { FEATURED_GAMES } from "@/lib/featured-games";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Satta Result Timings Today — Gali, Desawar & More",
  description:
    "View the published result schedule in IST for Gali, Desawar, Faridabad, Ghaziabad, Delhi Bazar and other featured markets, with direct result and chart links.",
  alternates: { canonical: "/result-timings" },
  openGraph: {
    title: "Daily Satta Result Timings in IST",
    description:
      "A clear schedule for featured market result times, plus direct links to daily results and historical charts.",
    url: "/result-timings",
    type: "website",
  },
};

const faqs = [
  {
    question: "Which time zone does the schedule use?",
    answer:
      "All times on this page use Indian Standard Time (IST, Asia/Kolkata).",
  },
  {
    question: "Does a scheduled time guarantee an immediate update?",
    answer:
      "No. A schedule is the usual publication time. A result may appear later when the source announcement is delayed.",
  },
  {
    question: "Why can Gali remain the latest result after midnight?",
    answer:
      "Gali is a late-night market. Until the next day’s first result is available, it can remain the most recently published result on the site.",
  },
  {
    question: "Where can I find older records?",
    answer:
      "Use the Charts page or open a featured market page to browse monthly and yearly historical records.",
  },
];

export default function ResultTimingsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Daily Satta Result Timings in IST",
        url: `${SITE_URL}/result-timings`,
        description: metadata.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Result Timings",
            item: `${SITE_URL}/result-timings`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <main className="mx-auto max-w-5xl px-3 py-6 md:px-6 md:py-9">
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-[#7a5a1a]">
        <Link href="/" className="font-bold hover:underline">Home</Link>
        <span aria-hidden="true"> / </span>
        <span>Result Timings</span>
      </nav>

      <header className="rounded-2xl border-2 border-[#e0850b] bg-gradient-to-b from-[#FFF7DA] to-[#FCE38A] px-4 py-7 text-center shadow-lg md:px-8 md:py-10">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#a5370c] px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[#FFE071]">
          <FiClock aria-hidden="true" /> IST schedule
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-[#3a1d00] md:text-4xl">
          Daily Satta Result Timings
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm font-medium leading-relaxed text-[#70501a] md:text-base">
          Check the usual publication time for each featured market. Times are
          shown in Indian Standard Time and may shift when an announcement is delayed.
        </p>
      </header>

      <section aria-labelledby="schedule-heading" className="mt-7">
        <div className="mb-3 flex items-center gap-2">
          <FiClock className="text-[#a5370c]" aria-hidden="true" />
          <h2 id="schedule-heading" className="text-xl font-extrabold text-[#a5370c] md:text-2xl">
            Featured market schedule
          </h2>
        </div>
        <div className="overflow-hidden rounded-xl border-2 border-[#e0850b] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead className="bg-[#a5370c] text-[#FFE071]">
                <tr>
                  <th className="px-4 py-3 text-sm font-extrabold">Market</th>
                  <th className="px-4 py-3 text-sm font-extrabold">Usual time</th>
                  <th className="px-4 py-3 text-right text-sm font-extrabold">Page</th>
                </tr>
              </thead>
              <tbody>
                {FEATURED_GAMES.map((game, index) => (
                  <tr key={game.slug} className={index % 2 ? "bg-[#fffbe9]" : "bg-white"}>
                    <th scope="row" className="border-t border-[#f0e2a6] px-4 py-3 font-bold text-[#3a1d00]">
                      {game.name}
                    </th>
                    <td className="border-t border-[#f0e2a6] px-4 py-3 font-mono font-bold text-[#a5370c]">
                      {game.time} IST
                    </td>
                    <td className="border-t border-[#f0e2a6] px-4 py-3 text-right">
                      <Link href={`/${game.slug}-result`} className="font-bold text-[#a5370c] underline-offset-4 hover:underline">
                        View result
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[#f0e2a6] bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#a5370c]">
            <FiInfo aria-hidden="true" /> How updates work
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            The homepage checks the latest available daily data and keeps an
            undeclared market in a waiting state. If today has no declaration yet,
            the latest completed result remains visible so visitors are not shown
            an empty headline card.
          </p>
        </div>
        <div className="rounded-xl border border-[#f0e2a6] bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#a5370c]">
            <FiBarChart2 aria-hidden="true" /> Historical records
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            Daily values are organized into monthly and yearly tables. These
            charts document past records only and do not predict future results.
          </p>
          <Link href="/charts" className="mt-3 inline-flex min-h-11 items-center font-bold text-[#a5370c] hover:underline">
            Browse chart records →
          </Link>
        </div>
      </section>

      <section aria-labelledby="timing-faq" className="mt-8 rounded-xl border border-[#f0e2a6] bg-white p-5 shadow-sm md:p-7">
        <h2 id="timing-faq" className="text-xl font-extrabold text-[#a5370c] md:text-2xl">Result timing FAQ</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-bold text-[#3a1d00]">{faq.question}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
