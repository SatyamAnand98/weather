import { NextRequest, NextResponse } from "next/server";

import type { GeocodingResult } from "@/types/weather";

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

type OpenMeteoGeocodeResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  population?: number;
};

type OpenMeteoGeocodeResponse = {
  results?: OpenMeteoGeocodeResult[];
  error?: boolean;
  reason?: string;
};

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const params = new URLSearchParams({
    name: query,
    count: "10",
    language: "en",
    format: "json"
  });

  try {
    const response = await fetch(`${GEOCODING_ENDPOINT}?${params.toString()}`, {
      next: { revalidate: 60 * 60 * 24 },
      headers: {
        Accept: "application/json"
      }
    });

    const data = (await response.json()) as OpenMeteoGeocodeResponse;

    if (!response.ok || data.error) {
      throw new Error(data.reason || "Location search failed.");
    }

    const results: GeocodingResult[] =
      data.results?.map((item) => ({
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        elevation: item.elevation,
        timezone: item.timezone,
        country: item.country,
        countryCode: item.country_code,
        admin1: item.admin1,
        admin2: item.admin2,
        population: item.population
      })) ?? [];

    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to search locations."
      },
      { status: 502 }
    );
  }
}
