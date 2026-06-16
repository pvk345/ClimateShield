"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="w-full border-b border-zinc-800 bg-black px-6 py-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-base font-semibold text-zinc-50">
          🔥 ClimateShield
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/" className={`text-sm transition-colors ${pathname === "/" ? "text-zinc-50 font-medium" : "text-zinc-400 hover:text-zinc-200"}`}>
            Risk Scorer
          </Link>
          <Link href="/compare" className={`text-sm transition-colors ${pathname === "/compare" ? "text-zinc-50 font-medium" : "text-zinc-400 hover:text-zinc-200"}`}>
            Compare
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className={`text-sm transition-colors ${pathname === "/dashboard" ? "text-zinc-50 font-medium" : "text-zinc-400 hover:text-zinc-200"}`}>
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className={`text-sm transition-colors ${pathname === "/login" ? "text-zinc-50 font-medium" : "text-zinc-400 hover:text-zinc-200"}`}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-zinc-400 hover:text-zinc-50"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-4 pt-4 pb-2 px-2">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm text-zinc-400 hover:text-zinc-50">Risk Scorer</Link>
          <Link href="/compare" onClick={() => setMenuOpen(false)} className="text-sm text-zinc-400 hover:text-zinc-50">Compare</Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-zinc-400 hover:text-zinc-50">Dashboard</Link>
              <button onClick={handleSignOut} className="text-sm text-zinc-400 hover:text-zinc-50 text-left">Sign Out</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm text-zinc-400 hover:text-zinc-50">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}