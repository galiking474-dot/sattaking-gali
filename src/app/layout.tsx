// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { Header } from "@/components/layout/Header";
// import { Footer } from "@/components/layout/Footer";
// import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
// import { Toaster } from "react-hot-toast";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   metadataBase: new URL("https://sattaking-gali.com"),
//   title: {
//     default: "Satta King Gali Result 2026 | Live Gali, Desawar, Faridabad & Ghaziabad Results",
//     template: "%s | SattaKing-Gali",
//   },
//   description:
//     "Satta King Gali Result 2026 — live Gali, Desawar, Faridabad, Ghaziabad, Delhi Bazar & Shree Ganesh results. Fast daily updates, Satta King charts, records and market results.",
//   keywords: [
//     "satta king gali",
//     "satta king",
//     "gali result",
//     "satta king result",
//     "satta result",
//     "desawar result",
//     "ghaziabad result",
//     "faridabad result",
//     "satta king chart",
//     "satta king 2026",
//     "satta king live",
//     "delhi bazar result",
//     "shree ganesh result",
//     "satta king today",
//     "satta result today",
//     "gali satta result",
//     "play bazaar",
//     "satta king 786",
//     "satta king fast",
//     "satta king up",
//     "delhi satta king",
//     "black satta king",
//     "sattaking gali",
//   ],
//   openGraph: {
//     type: "website",
//     locale: "en_IN",
//     url: "https://sattaking-gali.com",
//     siteName: "SattaKing-Gali",
//     title: "Satta King Gali Result 2026 | Live Gali, Desawar, Faridabad & Ghaziabad Results",
//     description:
//       "Satta King Gali Result 2026 — live Gali, Desawar, Faridabad, Ghaziabad, Delhi Bazar & Shree Ganesh results. Fast daily updates, charts and records.",
//   },
//   robots: {
//     index: true,
//     follow: true,
//   },
//   alternates: {
//     canonical: "https://sattaking-gali.com",
//   },
// };

// // Structured data (SEO) — WebSite + Organization
// const jsonLd = {
//   "@context": "https://schema.org",
//   "@type": "WebSite",
//   name: "SattaKing-Gali",
//   url: "https://sattaking-gali.com",
//   description:
//     "Live Satta King Gali, Desawar, Faridabad and Ghaziabad results with fast daily updates and chart records.",
//   potentialAction: {
//     "@type": "SearchAction",
//     target: "https://sattaking-gali.com/charts?q={search_term_string}",
//     "query-input": "required name=search_term_string",
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html
//       lang="en"
//       className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
//     >
//       <body className="min-h-full flex flex-col">
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//         />
//         <Toaster position="top-right" />
//         <Header />
//         <main className="flex-1">{children}</main>
//         {/* <WhatsAppButton /> */}
//       </body>
//     </html>
//   );
// }
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

  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const title = `Satta King Gali Result ${formattedDate} | Live Gali, Desawar, Faridabad & Ghaziabad Results`;

  const description = `Satta King Gali Result ${formattedDate} — live Gali, Desawar, Faridabad, Ghaziabad, Delhi Bazar & Shree Ganesh results. Fast daily updates, Satta King charts, records and market results.`;

  return {
    metadataBase: new URL("https://sattaking-gali.com"),

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
      url: "https://sattaking-gali.com",
      siteName: "SattaKing-Gali",
      title,
      description,
    },

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical: "https://www.sattaking-gali.com",
    },
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.sattaking-gali.com/#website",
      url: "https://www.sattaking-gali.com/",
      name: "SattaKing-Gali.com",
      description:
        "Satta King Gali results, Gali Result, Desawar Result, Faridabad Result, Ghaziabad Result and Satta King charts.",
      inLanguage: "en-IN",
      publisher: {
        "@id": "https://www.sattaking-gali.com/#organization",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.sattaking-gali.com/#organization",
      name: "SattaKing-Gali.com",
      url: "https://www.sattaking-gali.com/",
    },
    {
      "@type": "WebPage",
      "@id": "https://www.sattaking-gali.com/#webpage",
      url: "https://www.sattaking-gali.com/",
      name: "Satta King Gali 2026: Fast Live Results for Desawar, Faridabad, Ghaziabad, Gali & More",
      description:
        "Check Satta King Gali results, Gali Result, Desawar Result, Faridabad Result, Ghaziabad Result and Satta King charts with daily updates.",
      isPartOf: {
        "@id": "https://www.sattaking-gali.com/#website",
      },
      about: {
        "@id": "https://www.sattaking-gali.com/#organization",
      },
      breadcrumb: {
        "@id": "https://www.sattaking-gali.com/#breadcrumb",
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.sattaking-gali.com/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.sattaking-gali.com/",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.sattaking-gali.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is SattaKing-Gali?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SattaKing-Gali provides daily result information for markets including Gali, Desawar, Faridabad and Ghaziabad.",
          },
        },
        {
          "@type": "Question",
          name: "How often are results updated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Results are updated when the respective market declares its result.",
          },
        },
        {
          "@type": "Question",
          name: "Can I check old Satta results?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Previous results and charts are available for different markets.",
          },
        },
        {
          "@type": "Question",
          name: "Is this website mobile friendly?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The website is designed to work on mobile, tablet and desktop devices.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
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
