import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date();
  const shortDate = now
    .toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(/\bSept\b/, "Sep");
  const longDate = now.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const title = `SattaKing-Gali.com | Satta King Result Today ${shortDate}`;
  const description = `Check Satta King Result Today ${longDate}. View the latest available Gali, Desawar, Faridabad and Ghaziabad results, schedules and historical charts.`;

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    verification: {
      google: "GC76cAN54Y8QT4fuDqTr-P_sNckbLt4wkHfp5xwJUx8",
    },
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description,
    keywords: [
      "satta king result today",
      "gali result",
      "desawar result",
      "faridabad result",
      "ghaziabad result",
      "satta king chart",
    ],
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: "/",
      siteName: SITE_NAME,
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
    alternates: { canonical: "/" },
    twitter: { card: "summary", title, description },
    manifest: "/manifest.json",
  };
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "SattaKing-Gali.com",
      description:
        "Daily game-wise result updates, schedules and historical chart records.",
      inLanguage: "en-IN",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "SattaKing-Gali.com",
      url: `${SITE_URL}/`,
      description:
        "SattaKing-Gali.com organizes publicly available game-wise result updates, schedules and historical chart records.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <JsonLd data={organizationJsonLd} />
        <Header />
        {children}
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
