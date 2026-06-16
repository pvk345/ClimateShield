import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  try {
    // FEMA National Risk Index - free, no key needed, real county-level risk
    const url = `https://hazards.fema.gov/nri/api/county?lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    const data = await res.json();

    const county = data?.[0];
    const floodScore = county?.RFLD_SCORE ?? null;
    const wildfireScore = county?.RWFR_SCORE ?? null;

    // Normalize 0-100
    const flood = floodScore ? Math.min(Math.round(floodScore), 100) : 20;
    const wildfire = wildfireScore ? Math.min(Math.round(wildfireScore), 100) : 20;

    return NextResponse.json({ flood, wildfire, county: county?.COUNTY });
  } catch (err) {
    return NextResponse.json({ error: "Risk lookup failed" }, { status: 500 });
  }
}