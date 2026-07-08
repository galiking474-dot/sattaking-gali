import { NextRequest } from "next/server";
import { getMonthlyChart, CHART_CACHE_HEADERS } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const monthName = searchParams.get("month") || "may";
  const year = searchParams.get("year") || "2026";

  const chart = await getMonthlyChart(monthName, year);

  if (!chart) {
    return Response.json(
      { success: false, error: "Data not available" },
      { status: 503, headers: { "Retry-After": "10" } }
    );
  }

  return Response.json(
    { success: true, month: chart.month, year: chart.year, results: chart.results },
    { headers: CHART_CACHE_HEADERS }
  );
}
