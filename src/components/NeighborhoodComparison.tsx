"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type PropertyScore = {
  label: string;
  wildfire: number;
  flood: number;
  composite: number;
  isSubject?: boolean;
};

type Props = {
  fips: string;
  lat: number;
  lon: number;
  wildfire: number;
  flood: number;
  composite: number;
};

export default function NeighborhoodComparison({ fips, lat, lon, wildfire, flood, composite }: Props) {
  const [scores, setScores] = useState<PropertyScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNearby() {
      const offsets = [
        { lat: 0.003, lon: 0, label: "Property A" },
        { lat: -0.003, lon: 0, label: "Property B" },
        { lat: 0, lon: 0.003, label: "Property C" },
        { lat: 0, lon: -0.003, label: "Property D" },
      ];

      const results: PropertyScore[] = [
        { label: "Your Property", wildfire, flood, composite, isSubject: true },
      ];

      for (const offset of offsets) {
        try {
          const nearLat = lat + offset.lat;
          const nearLon = lon + offset.lon;
          const res = await fetch(`/api/risk?fips=${fips}&lat=${nearLat}&lon=${nearLon}`);
          const data = await res.json();
          if (!data.error) {
            results.push({
              label: offset.label,
              wildfire: data.wildfire,
              flood: data.flood,
              composite: data.composite,
            });
          }
        } catch {
          // skip failed requests
        }
      }

      setScores(results);
      setLoading(false);
    }

    fetchNearby();
  }, [fips, lat, lon, wildfire, flood, composite]);

  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-400 text-center">Loading neighborhood comparison...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Neighborhood Comparison
        </h2>
        <p className="text-xs text-zinc-400">
          How this property compares to nearby properties within ~0.3 miles.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={scores}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#a1a1aa" }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
          <Bar dataKey="wildfire" name="Wildfire" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="flood" name="Flood" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="composite" name="Composite" fill="#a855f7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-5 gap-2">
        {scores.map((s) => (
          <div
            key={s.label}
            className={`flex flex-col gap-1 rounded-xl border p-3 text-center ${
              s.isSubject
                ? "border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
                : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{s.label}</p>
            <p className="text-lg font-bold text-zinc-950 dark:text-zinc-50">{s.composite}</p>
            <p className="text-xs text-zinc-400">composite</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400">
        Nearby properties are estimated based on proximity. Scores may vary based on exact location.
      </p>
    </div>
  );
}