"use client";

import { useState } from "react";
import ProjectionChart from "@/components/ProjectionChart";
import DownloadReport from "@/components/RiskReport";
import { supabase } from "@/lib/supabase";

type RiskResult = {
  address: string;
  wildfire: number;
  flood: number;
  composite: number;
  tier: "Low" | "Moderate" | "High" | "Extreme";
  zone: string;
  wildfireRating: string;
  floodRating: string;
  source: string;
  projections: { year: number; wildfire: number; flood: number; composite: number; }[];
};

function getTier(score: number): "Low" | "Moderate" | "High" | "Extreme" {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 75) return "High";
  return "Extreme";
}

function tierColor(tier: string) {
  switch (tier) {
    case "Low": return "text-teal-600 bg-teal-50 border-teal-200";
    case "Moderate": return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "High": return "text-orange-600 bg-orange-50 border-orange-200";
    case "Extreme": return "text-red-600 bg-red-50 border-red-200";
    default: return "";
  }
}

function getWildfireExplanation(score: number, location: string): string {
  if (score >= 75) return `${location} has an extremely high wildfire hazard based on FEMA data. The area has significant historical fire events, high vegetation density, and climate conditions that create dangerous fire weather.`;
  if (score >= 50) return `${location} has an elevated wildfire risk. The area experiences periodic fire weather conditions and has moderate vegetation that can fuel fires.`;
  if (score >= 25) return `${location} has a moderate wildfire risk. While fires are possible, the area has lower historical fire frequency compared to high risk zones.`;
  return `${location} has a low wildfire risk based on historical data, vegetation, and climate patterns in the area.`;
}

function getFloodExplanation(score: number, location: string): string {
  if (score >= 75) return `${location} has an extremely high flood risk. The area is prone to significant flooding events based on historical data, terrain, and proximity to water bodies.`;
  if (score >= 50) return `${location} has an elevated flood risk. The area experiences periodic flooding and may be partially within FEMA designated flood zones.`;
  if (score >= 25) return `${location} has a moderate flood risk. Flooding is possible during heavy rainfall events but is less frequent than high risk areas.`;
  return `${location} has a low flood risk. The area has minimal historical flooding and favorable terrain and drainage conditions.`;
}

function getOverallExplanation(tier: string, location: string): string {
  switch (tier) {
    case "Extreme": return `This property is in an Extreme risk tier. Homeowners in ${location} typically face significantly higher insurance premiums. Flood insurance is strongly recommended regardless of mortgage requirements.`;
    case "High": return `This property is in a High risk tier. Homeowners in ${location} should review their insurance coverage carefully and consider additional flood or fire protection measures.`;
    case "Moderate": return `This property is in a Moderate risk tier. Standard insurance coverage is likely sufficient but reviewing your policy for natural hazard coverage is recommended.`;
    default: return `This property is in a Low risk tier. ${location} has favorable natural hazard conditions compared to the national average.`;
  }
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [error, setError] = useState("");

  async function saveAddress() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!result) return;

    const { error } = await supabase.from("saved_addresses").insert({
      user_id: user.id,
      address: result.address,
      wildfire: result.wildfire,
      flood: result.flood,
      composite: result.composite,
      tier: result.tier,
      zone: result.zone,
    });

    if (error) {
      alert("Error saving address");
    } else {
      alert("Address saved!");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const encoded = encodeURIComponent(address);
      const geoRes = await fetch(`/api/geocode?address=${encoded}`);
      const geoData = await geoRes.json();
      const match = geoData?.result?.addressMatches?.[0];

      if (!match) {
        setError("Address not found. Try a more specific US address.");
        setLoading(false);
        return;
      }

      const fips = match.geographies?.Counties?.[0]?.GEOID;

      if (!fips) {
        setError("Could not determine county for this address.");
        setLoading(false);
        return;
      }

      const riskRes = await fetch(`/api/risk?fips=${fips}`);
      const riskData = await riskRes.json();

      if (riskData.error) {
        setError("Could not find risk data for this address.");
        setLoading(false);
        return;
      }

      const { wildfire, flood, composite } = riskData;
      const tier = getTier(composite);

      setResult({
        address: match.matchedAddress,
        wildfire,
        flood,
        composite,
        tier,
        zone: riskData.county === riskData.state
          ? riskData.county
          : riskData.county + ", " + riskData.state,
        wildfireRating: riskData.wildfireRating,
        floodRating: riskData.floodRating,
        source: riskData.source,
        projections: riskData.projections,
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 py-16 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
            Wildfire &amp; Flood Risk Scorer
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Enter an address to see its wildfire and flood risk score.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter an address, city, or ZIP code"
            className="h-12 w-full flex-1 rounded-full border border-zinc-300 bg-white px-5 text-base text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-700"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 shrink-0 rounded-full bg-zinc-950 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check Risk"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {result && (
          <div className="w-full flex flex-col gap-4 mt-4">
            <p className="text-sm text-zinc-500 text-center">
              Results for: <span className="font-medium text-zinc-800 dark:text-zinc-200">{result.address}</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Wildfire Risk</p>
                <p className="text-4xl font-bold text-zinc-950 dark:text-zinc-50">{result.wildfire}</p>
                <p className="text-xs text-zinc-400">out of 100</p>
              </div>

              <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Flood Risk</p>
                <p className="text-4xl font-bold text-zinc-950 dark:text-zinc-50">{result.flood}</p>
                <p className="text-xs text-zinc-400">out of 100</p>
              </div>

              <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Composite Score</p>
                <p className="text-4xl font-bold text-zinc-950 dark:text-zinc-50">{result.composite}</p>
                <p className="text-xs text-zinc-400">out of 100</p>
              </div>
            </div>

            <div className={`rounded-2xl border px-6 py-4 text-sm font-medium ${tierColor(result.tier)}`}>
              Risk Tier: <span className="font-bold">{result.tier}</span>
            </div>

            <div className="w-full flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 text-left">
              <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                Why this risk score?
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-orange-500">
                    🔥 Wildfire Risk — {result.wildfire}/100
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {getWildfireExplanation(result.wildfire, result.zone)}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-blue-500">
                    🌊 Flood Risk — {result.flood}/100
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {getFloodExplanation(result.flood, result.zone)}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    ⚠️ Overall Assessment
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {getOverallExplanation(result.tier, result.zone)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mt-2">
                Source: ClimateShield XGBoost Model v1.0 • FEMA NRI + USFS Wildfire Risk + FEMA Disaster History • County-level data
              </p>
            </div>

            <button
              onClick={saveAddress}
              className="w-full h-12 rounded-full border border-zinc-700 bg-zinc-900 px-8 text-base font-medium text-zinc-50 transition-colors hover:bg-zinc-800"
            >
              ⭐ Save This Address
            </button>

            <ProjectionChart 
              wildfire={result.wildfire} 
              flood={result.flood} 
              projections={result.projections}
            />
            <DownloadReport
              address={result.address}
              wildfire={result.wildfire}
              flood={result.flood}
              composite={result.composite}
              tier={result.tier}
              zone={result.zone}
            />
          </div>
        )}
      </main>
    </div>
  );
}