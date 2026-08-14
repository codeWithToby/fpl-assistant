import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

// Matches fpl.team's own choice of typeface — a rounded, friendly
// geometric sans that reads as "FPL" rather than "generic SaaS."
const quicksand = Quicksand({
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FPL Captain Assistant",
  description:
    "Enter your FPL squad and get a captain pick with the reasoning behind it — xGI, fixture difficulty, and form, combined into one call.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
