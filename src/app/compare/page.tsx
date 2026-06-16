"use client";

import { useState } from "react";
import ProjectionChart from "@/components/ProjectionChart";

type RiskResult = {
  address: string;
  wildfire: number;
  flood: number;
  composite: number;
  tier: "Low" | "Moderate" | "High" | "Extreme";
  zone: string;
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

async function fetchRisk(address: string): Promise<RiskResult | null> {
  const encoded = encodeURIComponent(address);
  const geoRes = await fetch(`/api/geocode?address=${encoded}`);
  const geoData = await geoRes.json();
  const match = geoData?.result?.addressMatches?.[0];
  if (!match) return null;

  const fips = match.geographies?.Counties?.[0]?.GEOID;
  if (!fips) return null;

  const riskRes = await fetch(`/api/risk?fips=${fips}`);
  const riskData = await riskRes.json();
  if (riskData.error) return null;

  const { wildfire, flood, composite } = riskData;
  const tier = getTier(composite);

  return {
    address: match.matchedAddress,
    wildfire,
    flood,
    composite,
    tier,
    zone: riskData.county === riskData.state
      ? riskData.county
      : riskData.county + ", " + riskData.state,
  };
}

function ScoreCard({ label, value1, value2 }: { label: string; value1: number; value2: number }) {
  const better = value1 < value2 ? 1 : value1 > value2 ? 2 : 0;
  return (
    <div className="grid grid-cols-3 items-center gap-2 py-3 border-b border-zinc-800">
      <p className={`text-2xl font-bold text-center ${better === 1 ? "text-teal-400" : "text-zinc-50"}`}>
        {value1}
      </p>
      <p className="text-xs text-zinc-500 text-center uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold text-center ${better === 2 ? "text-teal-400" : "text-zinc-50"}`}>
        {value2}
      </p>
    </div>
  );
}

export default function ComparePage() {
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [result1, setResult1] = useState<RiskResult | null>(null);
  const [result2, setResult2] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    if (!address1.trim() || !address2.trim()) return;

    setLoading(true);
    setError("");
    setResult1(null);
    setResult2(null);

    try {
      const [r1, r2] = await Promise.all([
        fetchRisk(address1),
        fetchRisk(address2),
      ]);

      if (!r1 || !r2) {
        setError("We couldn't find one or both addresses. Try including the full street, city, state and ZIP code — for example: '123 Main St, Houston TX 77002'.");
        setLoading(false);
        return;
      }

      setResult1(r1);
      setResult2(r2);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center bg-zinc-50 dark:bg-black min-h-screen px-6 py-16">
      <main className="flex w-full max-w-3xl flex-col gap-8">
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Compare Two Properties
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Search two addresses side by side to compare their climate risk.
          </p>
        </div>

        <form onSubmit={handleCompare} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="First address"
              className="h-12 rounded-full border border-zinc-300 bg-white px-5 text-base text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Second address"
              className="h-12 rounded-full border border-zinc-300 bg-white px-5 text-base text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-full bg-zinc-950 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 disabled:opacity-50"
          >
            {loading ? "Comparing..." : "Compare Properties"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {result1 && result2 && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 items-center gap-2">
              <p className="text-sm font-medium text-zinc-300 text-center truncate">{result1.zone}</p>
              <p className="text-xs text-zinc-500 text-center uppercase tracking-wide">Location</p>
              <p className="text-sm font-medium text-zinc-300 text-center truncate">{result2.zone}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-1">
              <ScoreCard label="Wildfire Risk" value1={result1.wildfire} value2={result2.wildfire} />
              <ScoreCard label="Flood Risk" value1={result1.flood} value2={result2.flood} />
              <ScoreCard label="Composite Score" value1={result1.composite} value2={result2.composite} />

              <div className="grid grid-cols-3 items-center gap-2 pt-3">
                <div className={`text-center text-xs font-bold px-3 py-1 rounded-full border ${tierColor(result1.tier)}`}>
                  {result1.tier}
                </div>
                <p className="text-xs text-zinc-500 text-center uppercase tracking-wide">Risk Tier</p>
                <div className={`text-center text-xs font-bold px-3 py-1 rounded-full border ${tierColor(result2.tier)}`}>
                  {result2.tier}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-zinc-400">10-Year Projection — {result1.zone}</h2>
              <ProjectionChart wildfire={result1.wildfire} flood={result1.flood} />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-zinc-400">10-Year Projection — {result2.zone}</h2>
              <ProjectionChart wildfire={result2.wildfire} flood={result2.flood} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}