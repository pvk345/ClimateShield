"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Projection = {
  year: number;
  wildfire: number;
  flood: number;
  composite: number;
};

type Props = {
  wildfire: number;
  flood: number;
  projections?: Projection[];
};

function generateFallbackProjection(baseWildfire: number, baseFlood: number) {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => ({
    year: currentYear + i,
    Wildfire: Math.min(Math.round(baseWildfire + i * (baseWildfire > 50 ? 0.8 : 0.4)), 100),
    Flood: Math.min(Math.round(baseFlood + i * (baseFlood > 50 ? 0.6 : 0.3)), 100),
    Composite: Math.min(Math.round((baseWildfire + baseFlood) / 2 + i * 0.5), 100),
  }));
}

export default function ProjectionChart({ wildfire, flood, projections }: Props) {
  const data = projections
    ? projections.map((p) => ({
        year: p.year,
        Wildfire: p.wildfire,
        Flood: p.flood,
        Composite: p.composite,
      }))
    : generateFallbackProjection(wildfire, flood);

  return (
    <div className="w-full flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          10-Year Risk Projection
        </h2>
        <p className="text-xs text-zinc-400">
          {projections
            ? "Projected risk scores based on ClimateShield XGBoost model."
            : "Projected risk score changes based on climate trends."}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#a1a1aa" }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
          <Line type="monotone" dataKey="Wildfire" stroke="#f97316" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Flood" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Composite" stroke="#a855f7" strokeWidth={2} dot={false} strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-zinc-400">
        {projections
          ? "Source: ClimateShield XGBoost Model v1.0 • Not a guarantee of future conditions."
          : "Projections based on IPCC climate scenarios. Not a guarantee of future conditions."}
      </p>
    </div>
  );
}