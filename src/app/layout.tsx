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

export const metadata: Metadata = {
  metadataBase: new URL("https://sattaking-gali.com"),
  title: {
    default: "Satta King Gali Result 2026 | Live Gali, Desawar, Faridabad & Ghaziabad Results",
    template: "%s | SattaKing-Gali",
  },
  description:
    "Satta King Gali Result 2026 — live Gali, Desawar, Faridabad, Ghaziabad, Delhi Bazar & Shree Ganesh results. Fast daily updates, Satta King charts, records and market results.",
  keywords: [
    "satta king gali",
    "satta king",
    "gali result",
    "satta king result",
    "satta result",
    "desawar result",
    "ghaziabad result",
    "faridabad result",
    "satta king chart",
    "satta king 2026",
    "satta king live",
    "delhi bazar result",
    "shree ganesh result",
    "satta king today",
    "satta result today",
    "gali satta result",
    "play bazaar",
    "satta king 786",
    "satta king fast",
    "satta king up",
    "delhi satta king",
    "black satta king",
    "sattaking gali",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sattaking-gali.com",
    siteName: "SattaKing-Gali",
    title: "Satta King Gali Result 2026 | Live Gali, Desawar, Faridabad & Ghaziabad Results",
    description:
      "Satta King Gali Result 2026 — live Gali, Desawar, Faridabad, Ghaziabad, Delhi Bazar & Shree Ganesh results. Fast daily updates, charts and records.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://sattaking-gali.com",
  },
};

// Structured data (SEO) — WebSite + Organization
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SattaKing-Gali",
  url: "https://sattaking-gali.com",
  description:
    "Live Satta King Gali, Desawar, Faridabad and Ghaziabad results with fast daily updates and chart records.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://sattaking-gali.com/charts?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
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
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Toaster position="top-right" />
        <Header />
        <main className="flex-1">{children}</main>
        {/* <WhatsAppButton /> */}
      </body>
    </html>
  );
}
