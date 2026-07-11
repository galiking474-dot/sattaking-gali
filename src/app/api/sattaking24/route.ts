import { NextResponse } from "next/server";
import { getSK24Data, EDGE_CACHE_HEADERS } from "@/lib/api-helpers";

export async function GET() {
  const data = await getSK24Data();

  if (!data) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 503, headers: { "Retry-After": "10" } }
    );
  }

  return NextResponse.json(
    { success: true, games: data.games, spotlight: data.spotlight },
    { headers: EDGE_CACHE_HEADERS }
  );
}
