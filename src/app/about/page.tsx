import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About SattaKing-Gali — Updates, Sources & Corrections",
  description: "Learn how SattaKing-Gali organizes public result updates, schedules and historical charts, including our correction and responsible-use policies.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About SattaKing-Gali",
    description: "How result updates, schedules, historical records and correction reports are handled.",
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5f] text-center mb-8">
        About SattaKing-Gali
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">Who We Are</h2>
          <p>
            SattaKing-Gali is an independent information website that organizes
            publicly available result updates for markets including Gali,
            Desawar, Ghaziabad and Faridabad. The site is designed to make daily
            updates, expected times and older records easier to find on mobile
            and desktop devices.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">Our Mission</h2>
          <p>
            Our goal is to present the latest available information in a clear,
            game-wise format. A scheduled time is not a guarantee that a result
            will appear immediately; source announcements can be delayed. When a
            result has not been confirmed, the interface shows it as pending.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">What We Offer</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Game-wise daily result status and expected result times</li>
            <li>Monthly and yearly historical record tables</li>
            <li>Direct links between current results and related archives</li>
            <li>A responsive layout for phones, tablets and desktops</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">How Updates Are Handled</h2>
          <p>
            Result data is collected from available public sources and organized
            by market and date. Automated checks can be supplemented by a dated
            correction when a source changes or an entry is incomplete. Historical
            pages show a dash where the site has no stored record rather than
            inventing a value.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">Corrections and Feedback</h2>
          <p>
            If you notice an incorrect market name, time or result, send the page
            URL and the corrected information through our{" "}
            <Link href="/contact" className="font-bold text-[#a5370c] hover:underline">
              contact page
            </Link>. We review correction reports against the available source
            information before updating a record.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">Useful Sections</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/result-timings" className="rounded-lg border border-[#e0850b] bg-[#fff7e0] px-4 py-3 font-bold text-[#a5370c] hover:bg-[#FCE38A]">
              Result timings
            </Link>
            <Link href="/charts" className="rounded-lg border border-[#e0850b] bg-[#fff7e0] px-4 py-3 font-bold text-[#a5370c] hover:bg-[#FCE38A]">
              Chart records
            </Link>
            <Link href="/blog" className="rounded-lg border border-[#e0850b] bg-[#fff7e0] px-4 py-3 font-bold text-[#a5370c] hover:bg-[#FCE38A]">
              Guides
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">Disclaimer</h2>
          <p className="text-sm text-gray-500">
            This website is for informational purposes only. It does not accept
            bets, process payments or claim that historical records can predict a
            future result. Please review the full{" "}
            <Link href="/disclaimer" className="font-semibold text-[#a5370c] hover:underline">
              disclaimer
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
