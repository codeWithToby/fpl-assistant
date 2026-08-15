"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Player, Team } from "@/lib/fpl/types";
import { POSITION_LABELS, SQUAD_POSITION_NEEDS, formatPrice } from "@/lib/fpl/constants";

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 25;

interface Props {
  allPlayers: Player[];
  teams: Team[];
  excludeIds: Set<number>;
  onSelect: (id: number) => void;
  disabled: boolean;
  positionCounts: Record<number, number>;
  positionFilter: number | null;
  onClearPositionFilter: () => void;
  remainingBudget: number; // tenths of £m, matching Player.nowCost
}

export default function PlayerSearchCombobox({
  allPlayers,
  teams,
  excludeIds,
  onSelect,
  disabled,
  positionCounts,
  positionFilter,
  onClearPositionFilter,
  remainingBudget,
}: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  // A position slot click on the pitch should land the user straight in
  // the search box, ready to type — no separate "now click here" step.
  useEffect(() => {
    if (positionFilter !== null) inputRef.current?.focus();
  }, [positionFilter]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const eligible = allPlayers
      .filter((p) => !excludeIds.has(p.id))
      .filter((p) => (positionCounts[p.elementType] ?? 0) < SQUAD_POSITION_NEEDS[p.elementType])
      .filter((p) => positionFilter === null || p.elementType === positionFilter)
      .filter((p) => p.nowCost <= remainingBudget);

    // With a position already chosen (via a pitch-slot click), show the
    // top owned players in that position immediately rather than making
    // the user type first — otherwise stay empty until there's a query,
    // so we're not dumping 600+ players into the list.
    if (q.length < MIN_QUERY_LENGTH) {
      if (positionFilter === null) return [];
      return [...eligible].sort((a, b) => b.selectedByPercent - a.selectedByPercent).slice(0, MAX_RESULTS);
    }

    return eligible
      .filter((p) => {
        const team = teamsById.get(p.team);
        return (
          p.webName.toLowerCase().includes(q) ||
          team?.shortName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.selectedByPercent - a.selectedByPercent)
      .slice(0, MAX_RESULTS);
  }, [query, allPlayers, excludeIds, teamsById, positionCounts, positionFilter, remainingBudget]);

  return (
    <div className="relative">
      {positionFilter !== null && (
        <div className="mb-2 flex items-center justify-between rounded-[8px] bg-pitch-soft px-3 py-1.5">
          <span className="text-xs font-bold text-brand-light dark:text-pitch">
            Adding {POSITION_LABELS[positionFilter]}
          </span>
          <button
            type="button"
            onClick={() => {
              onClearPositionFilter();
              setQuery("");
            }}
            className="text-xs font-bold text-brand-light hover:text-brand dark:text-pitch dark:hover:text-pitch-dark"
            aria-label="Cancel adding by position"
          >
            ✕
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          disabled
            ? "Squad full — remove a player to swap"
            : positionFilter !== null
              ? `Search ${POSITION_LABELS[positionFilter]} to add…`
              : "Search a player to add…"
        }
        className="w-full rounded-[10px] border border-zinc-300 px-4 py-3 text-base text-foreground placeholder:text-zinc-400 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:bg-zinc-50 disabled:text-zinc-400"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-[10px] border border-zinc-200 bg-background shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]">
          {results.map((p) => {
            const team = teamsById.get(p.team);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(p.id);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-pitch-soft"
                >
                  <span className="font-medium text-foreground">{p.webName}</span>
                  <span className="text-xs text-zinc-500">
                    {POSITION_LABELS[p.elementType]} · {team?.shortName ?? "?"} ·{" "}
                    {formatPrice(p.nowCost)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
