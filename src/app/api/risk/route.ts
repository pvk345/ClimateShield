import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const county_fips = req.nextUrl.searchParams.get("fips");

  if (!county_fips) {
    return NextResponse.json({ error: "Missing FIPS code" }, { status: 400 });
  }

  try {
    const paddedFips = county_fips.padStart(5, "0");
    const mlRes = await fetch(
      `${process.env.ML_API_URL}/predict/${paddedFips}`
    );
    const data = await mlRes.json();

    if (data.error) {
      return NextResponse.json({ error: "County not found" }, { status: 404 });
    }

    return NextResponse.json({
      wildfire: data.wildfire,
      flood: data.flood,
      composite: data.composite,
      county: data.county,
      state: data.state,
      projections: data.projections,
      source: data.source,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch risk data" }, { status: 500 });
  }
}