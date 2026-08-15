"use client";

import { useState, type ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
}

export default function Tooltip({ label, children }: Props) {
  // Hover and click are independent booleans, OR'd together — an earlier
  // version had onClick toggle the same state onMouseEnter/Leave set,
  // which meant a real mouse click fired right after hover had already
  // opened it, so the toggle always flipped it straight back closed.
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const shown = hovered || pinned;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setPinned((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onBlur={() => setPinned(false)}
        className="cursor-help underline decoration-dotted decoration-1 underline-offset-2"
      >
        {children}
      </button>
      {shown && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-48 -translate-x-1/2 rounded-[8px] bg-brand px-2.5 py-1.5 text-xs font-medium leading-snug text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)]"
        >
          {label}
        </span>
      )}
    </span>
  );
}
