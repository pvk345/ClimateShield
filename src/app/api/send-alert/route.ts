import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Get all saved addresses
    const { data: addresses, error } = await supabase
      .from("saved_addresses")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let alertsSent = 0;

    for (const saved of addresses || []) {
      // Get user email
      const userRes = await supabase.auth.admin.getUserById(saved.user_id);
      const email = userRes.data.user?.email;
      if (!email) continue;

      // Get current score using geocoder to get fips from address
      const encoded = encodeURIComponent(saved.address);
      const geoRes = await fetch(
        `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?address=${encoded}&benchmark=Public_AR_Current&vintage=Current_Current&layers=Counties&format=json`
      );
      const geoData = await geoRes.json();
      const match = geoData?.result?.addressMatches?.[0];
      if (!match) continue;

      const fips = match.geographies?.Counties?.[0]?.GEOID;
      if (!fips) continue;

      const mlRes = await fetch(
        `${process.env.ML_API_URL}/predict/${fips}`
      );
      const current = await mlRes.json();
      if (current.error) continue;

      const scoreDiff = Math.abs(current.composite - saved.composite);

      // Only alert if score changed by more than 5 points
      if (scoreDiff > 5) {
        await resend.emails.send({
          from: "ClimateShield <onboarding@resend.dev>",
          to: email,
          subject: `Risk score changed for ${saved.address}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>🔥 Risk Score Update</h2>
              <p>The risk score for one of your saved addresses has changed significantly.</p>
              <h3>${saved.address}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <th style="text-align: left; padding: 8px; border-bottom: 1px solid #eee;">Metric</th>
                  <th style="text-align: left; padding: 8px; border-bottom: 1px solid #eee;">Previous</th>
                  <th style="text-align: left; padding: 8px; border-bottom: 1px solid #eee;">Current</th>
                </tr>
                <tr>
                  <td style="padding: 8px;">Wildfire</td>
                  <td style="padding: 8px;">${saved.wildfire}</td>
                  <td style="padding: 8px;">${current.wildfire}</td>
                </tr>
                <tr>
                  <td style="padding: 8px;">Flood</td>
                  <td style="padding: 8px;">${saved.flood}</td>
                  <td style="padding: 8px;">${current.flood}</td>
                </tr>
                <tr>
                  <td style="padding: 8px;">Composite</td>
                  <td style="padding: 8px;">${saved.composite}</td>
                  <td style="padding: 8px;">${current.composite}</td>
                </tr>
              </table>
              <p style="margin-top: 24px;">
                <a href="https://climate-shield.vercel.app" style="background: #18181b; color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none;">
                  View on ClimateShield
                </a>
              </p>
              <p style="color: #aaa; font-size: 12px; margin-top: 24px;">
                You're receiving this because you saved this address on ClimateShield.
              </p>
            </div>
          `,
        });
        alertsSent++;
      }
    }

    return NextResponse.json({ success: true, alertsSent });
  } catch (err) {
    return NextResponse.json({ error: "Failed to send alerts" }, { status: 500 });
  }
}