import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact the SattaKing-Gali team with a website question or feedback.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
