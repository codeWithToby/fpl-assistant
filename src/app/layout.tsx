import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

// Matches fpl.team's own choice of typeface — a rounded, friendly
// geometric sans that reads as "FPL" rather than "generic SaaS."
const quicksand = Quicksand({
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FPL Assistant",
  description:
    "Your FPL assistant for the decisions that matter each week — captain call, optimal XI, and clean sheet picks, decided for you with the reasoning behind every call.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
