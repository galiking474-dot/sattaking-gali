
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date();

  const shortDate = now.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).replace(/\bSept\b/, "Sep");
  const longDate = now.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const title = `SattaKing-Gali.com | Satta King Result Today ${shortDate}`;

  const description = `Check Satta King Result Today ${longDate} on SattaKing-Gali.com. View latest results, old charts, Gali, Desawar, Faridabad, Ghaziabad updates.`;

  return {
    metadataBase: new URL("https://www.sattaking-gali.com"),
    applicationName: "SattaKing-Gali",
    verification: {
      google: "GC76cAN54Y8QT4fuDqTr-P_sNckbLt4wkHfp5xwJUx8",
    },
  
    title: {
      default: title,
      template: "%s | SattaKing-Gali",
    },

    description,

    keywords: [
      "satta king gali",
      "gali result",
      "desawar result",
      "faridabad result",
      "ghaziabad result",
      "satta king chart",
      "satta king 2026",
    ],

    openGraph: {
      type: "website",
      locale: "en_IN",
      url: "/",
      siteName: "SattaKing-Gali",
      title,
      description,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    alternates: {
      canonical: "/",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    manifest: "/manifest.json",
  };
}
// export const metadata: Metadata = {
//   metadataBase: new URL("https://sattaking-gali.com"),
//   title: {
//     default:
//       "Satta King Gali Result 2026 | Live Gali, Desawar, Faridabad & Ghaziabad Results",
//     template: "%s | SattaKing-Gali",
//   },
//   description:
//     "Satta King Gali Result 2026 — live Gali, Desawar, Faridabad, Ghaziabad, Delhi Bazar & Shree Ganesh results. Fast daily updates, Satta King charts, records and market results.",
//   keywords: [
//     "satta king gali",
//     "satta king",
//     "gali result",
//     "satta king result",
//     "desawar result",
//     "ghaziabad result",
//     "faridabad result",
//     "satta king chart",
//     "satta king 2026",
//   ],
//   openGraph: {
//     type: "website",
//     locale: "en_IN",
//     url: "https://sattaking-gali.com",
//     siteName: "SattaKing-Gali",
//     title:
//       "Satta King Gali Result 2026 | Live Gali, Desawar, Faridabad & Ghaziabad Results",
//     description:
//       "Satta King Gali Result 2026 — live Gali, Desawar, Faridabad, Ghaziabad results.",
//   },
//   robots: {
//     index: true,
//     follow: true,
//   },
//   alternates: {
//     canonical: "https://www.sattaking-gali.com",
//   },
// };

function getJsonLd(dateModified: string) {
  const siteUrl = "https://www.sattaking-gali.com/";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: "SattaKing-Gali.com",
        description:
          "Satta King Result Today 2026 with latest Gali, Desawar, Faridabad, Ghaziabad, Delhi Bazar and other Satta result updates.",
        inLanguage: "en-IN",
        dateModified,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}?s={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: "SattaKing-Gali.com",
        url: siteUrl,
        description:
          "SattaKing-Gali.com provides game-wise Satta result updates, charts and previous records information.",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}wp-content/uploads/logo.png`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}#webpage`,
        url: siteUrl,
        name: "Satta King Result Today 2026 – Fast & Latest Satta Result Updates",
        isPartOf: { "@id": `${siteUrl}#website` },
        about: {
          "@type": "Thing",
          name: "Satta King Result Today 2026",
        },
        datePublished: "2026-01-01",
        dateModified,
        breadcrumb: { "@id": `${siteUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Satta King Result Today 2026",
            item: siteUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}#faq`,
        mainEntity: [
          [
            "Where can I check Satta King Result Today 2026?",
            "You can check the latest available Satta King Result 2026 from the dedicated result sections on SattaKing-Gali.com.",
          ],
          [
            "Which website provides fast Satta Result updates?",
            "SattaKing-Gali.com organizes different Satta markets separately so users can quickly find available result updates.",
          ],
          [
            "Where can I check Gali Satta King Result Today?",
            "You can visit the Gali Satta King section to check available Gali Result updates, charts and previous records.",
          ],
          [
            "How can I check Desawar Result 2026?",
            "Open the Desawar or Disawar result section to view available Desawar results and previous chart records.",
          ],
          [
            "Can I check old Satta King charts?",
            "Yes, available record chart sections allow users to browse previous Satta King records by game.",
          ],
          [
            "Are Satta King charts used to predict future results?",
            "No. Satta charts only display historical records and previous results. They cannot guarantee future outcomes.",
          ],
          [
            "Why should I use SattaKing-Gali.com for results?",
            "The website provides a simple game-wise structure where users can find different Satta results, charts and previous records in one place.",
          ],
        ].map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text },
        })),
      },
    ],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dateModified = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const jsonLd = getJsonLd(dateModified);

  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        <Header />

        {children}

        <Footer />
        <WhatsAppButton />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
