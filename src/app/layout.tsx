import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClimateShield — Property Risk Scorer",
  description: "Check wildfire and flood risk for any US address",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        <Navbar />
        {children}
        <footer className="w-full border-t border-zinc-800 bg-black px-6 py-6 mt-auto">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-xs text-zinc-500">© 2026 ClimateShield</p>
          <div className="flex gap-6">
            <a href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300">Terms</a>
            <a href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300">Privacy</a>
          </div>
        </div>
        </footer>
      </body>
    </html>
  );
}