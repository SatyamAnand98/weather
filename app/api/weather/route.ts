import { NextRequest, NextResponse } from "next/server";

import { getWeatherBundle } from "@/lib/open-meteo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = Number(searchParams.get("latitude"));
  const longitude = Number(searchParams.get("longitude"));
  const name = searchParams.get("name") ?? undefined;

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return NextResponse.json({ error: "Latitude must be a number between -90 and 90." }, { status: 400 });
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "Longitude must be a number between -180 and 180." }, { status: 400 });
  }

  try {
    const bundle = await getWeatherBundle({ latitude, longitude, name });

    return NextResponse.json(bundle, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load weather data."
      },
      { status: 502 }
    );
  }
}
