import { NextRequest } from "next/server";
import { getSatta29Chart, CHART_CACHE_HEADERS } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || "july";
  const year = searchParams.get("year") || "2026";

  const chart = await getSatta29Chart(month, year);

  if (!chart) {
    return Response.json(
      { success: false, error: "Data not available" },
      { status: 503, headers: { "Retry-After": "10" } }
    );
  }

  return Response.json(
    {
      success: true,
      month: chart.month,
      year: chart.year,
      games: chart.games,
      rows: chart.rows,
    },
    { headers: CHART_CACHE_HEADERS }
  );
}
