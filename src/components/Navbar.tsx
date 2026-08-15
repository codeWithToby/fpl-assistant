"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/squad", label: "Squad" },
  { href: "/team-of-the-week", label: "Team of the Week" },
  { href: "/feedback", label: "Feedback" },
];

// The captain's armband itself — a banded stripe wrapped at an angle (as
// if around an arm) with the same star mark TripleCaptainBadge already
// uses elsewhere, so "captain" reads as one consistent motif app-wide
// rather than two unrelated icons.
function Logo() {
  return (
    <Link href="/" className="flex flex-none items-center gap-2.5">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-pitch">
        <svg
          viewBox="0 0 16 16"
          className="h-5 w-5 text-brand"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="1.5" y="6" width="13" height="4.4" rx="2.2" transform="rotate(-9 8 8)" />
          <path
            d="M8 6.7 8.45 7.7l1.05.15-.75.75.18 1.1L8 9.15l-.93.45.18-1.1-.75-.75L7.55 7.7Z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      </span>
      <span className="text-base font-bold tracking-tight text-white sm:text-lg">
        Armband
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-brand px-4 lg:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${
                pathname === link.href ? "text-pitch" : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/squad"
          className="hidden flex-none rounded-[10px] bg-pitch px-5 py-2 text-sm font-bold uppercase tracking-wide text-brand transition-colors hover:bg-pitch-dark md:block"
        >
          Set up your squad
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[8px] text-white md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
            {open ? (
              <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-white/10 pb-4 pt-2 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-[8px] px-2 py-2.5 text-sm font-semibold ${
                pathname === link.href ? "bg-white/10 text-pitch" : "text-white/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/squad"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-[10px] bg-pitch px-5 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-brand"
          >
            Set up your squad
          </Link>
        </div>
      )}
    </nav>
  );
}
