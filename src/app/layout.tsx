import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

// Matches fpl.team's own choice of typeface — a rounded, friendly
// geometric sans that reads as "FPL" rather than "generic SaaS."
const quicksand = Quicksand({
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Armband",
  description:
    "Armband is your FPL assistant for the decisions that matter each week — captain call, optimal XI, and clean sheet picks, decided for you with the reasoning behind every call.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
