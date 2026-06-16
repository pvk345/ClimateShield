"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type SavedAddress = {
  id: string;
  address: string;
  wildfire: number;
  flood: number;
  composite: number;
  tier: string;
  zone: string;
  created_at: string;
};

function tierColor(tier: string) {
  switch (tier) {
    case "Low": return "text-teal-600 bg-teal-50 border-teal-200";
    case "Moderate": return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "High": return "text-orange-600 bg-orange-50 border-orange-200";
    case "Extreme": return "text-red-600 bg-red-50 border-red-200";
    default: return "";
  }
}

export default function DashboardPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from("saved_addresses")
        .select("*")
        .order("created_at", { ascending: false });

      setAddresses(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function deleteAddress(id: string) {
    await supabase.from("saved_addresses").delete().eq("id", id);
    setAddresses(addresses.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black min-h-screen">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-black min-h-screen px-6 py-16">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-zinc-50">Saved Addresses</h1>
          <p className="text-sm text-zinc-400">{user?.email}</p>
        </div>

        {addresses.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-zinc-400 mb-4">No saved addresses yet.</p>
            <Link
              href="/"
              className="text-sm text-zinc-300 underline hover:text-zinc-50"
            >
              Search an address to get started
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {addresses.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-zinc-50">{item.address}</p>
                  <button
                    onClick={() => deleteAddress(item.id)}
                    className="text-xs text-zinc-500 hover:text-red-400 shrink-0"
                  >
                    Remove
                  </button>
                </div>

                <p className="text-xs text-zinc-500">{item.zone}</p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Wildfire</p>
                    <p className="text-2xl font-bold text-zinc-50">{item.wildfire}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Flood</p>
                    <p className="text-2xl font-bold text-zinc-50">{item.flood}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Composite</p>
                    <p className="text-2xl font-bold text-zinc-50">{item.composite}</p>
                  </div>
                </div>

                <div className={`text-xs font-bold px-3 py-1 rounded-full border w-fit ${tierColor(item.tier)}`}>
                  {item.tier}
                </div>

                <p className="text-xs text-zinc-600">
                  Saved {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}