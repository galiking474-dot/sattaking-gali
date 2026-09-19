import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact the SattaKing-Gali team with a website question or feedback.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact SattaKing-Gali",
    description: "Send a website question, correction report or feedback to the SattaKing-Gali team.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
