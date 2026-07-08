import type { Metadata } from "next";

// Custom meta descriptions per game chart slug.
const CHART_DESCRIPTIONS: Record<string, string> = {
  "pushkar-bazar":
    "Check the latest Pushkar Bazar Satta King chart with today's result, old records, previous winning numbers, and complete historical data.",
  "delhi-metro":
    "View the updated Delhi Metro Satta King chart with today's result, old records, previous winning numbers, and complete chart history.",
  "shri-sayam":
    "Find the latest Shri Sayam Satta King chart featuring today's result, old records, previous winning numbers, and chart history.",
  kolmbia:
    "Explore the Kolmbia Satta King chart with today's result, old records, previous winning numbers, and complete historical charts.",
  "makka-madina":
    "Check Makka Madina Satta King chart with today's result, old records, previous winning numbers, and complete chart history.",
  "kalka-night":
    "View Kalka Night Satta King chart with today's result, old records, previous winning numbers, and complete historical data.",
  "shirdi-dham":
    "Get the latest Shirdi Dham Satta King chart including today's result, old records, previous winning numbers, and chart history.",
  "sadar-bazar":
    "Check Sadar Bazar Satta King chart with today's result, old records, previous winning numbers, and complete chart history.",
  "delhi-darbar":
    "View Delhi Darbar Satta King chart featuring today's result, old records, previous winning numbers, and historical charts.",
  kaliyar:
    "Find the latest Kaliyar Satta King chart with today's result, old records, previous winning numbers, and chart history.",
  gwalior:
    "Explore Gwalior Satta King chart with today's result, old records, previous winning numbers, and complete historical charts.",
  "new-ganga":
    "Check New Ganga Satta King chart with today's result, old records, previous winning numbers, and complete chart history.",
  "delhi-matka":
    "View Delhi Matka Satta King chart featuring today's result, old records, previous winning numbers, and historical data.",
  agra:
    "Check Agra Satta King chart with today's result, old records, previous winning numbers, and complete chart history.",
  fatehabad:
    "View Fatehabad Satta King chart with today's result, old records, previous winning numbers, and historical chart data.",
  alwar:
    "Explore Alwar Satta King chart featuring today's result, old records, previous winning numbers, and complete history.",
  "shakti-peeth":
    "Check Shakti Peeth Satta King chart with today's result, old records, previous winning numbers, and historical charts.",
  "mandi-bazar":
    "View Mandi Bazar Satta King chart with today's result, old records, previous winning numbers, and complete chart history.",
  "ghaziabad-king":
    "Find Ghaziabad King Satta King chart with today's result, old records, previous winning numbers, and complete historical charts.",
  mathura:
    "Check Mathura Satta King chart with today's result, old records, previous winning numbers, and complete chart history.",
  dwarka:
    "View Dwarka Satta King chart featuring today's result, old records, previous winning numbers, and complete historical data.",
};

function toTitleCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameCode: string }>;
}): Promise<Metadata> {
  const { gameCode } = await params;
  const gameName = toTitleCase(gameCode);

  const title = `${gameName} Satta King Chart | Today Result & Old Record`;
  const description =
    CHART_DESCRIPTIONS[gameCode] ??
    `Check the latest ${gameName} Satta King chart with today's result, old records, previous winning numbers, and complete historical data.`;
  const url = `https://todaysattaresults.com/chart/${gameCode}`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
