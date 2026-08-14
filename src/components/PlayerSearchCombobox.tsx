"use client";

import { useMemo, useState } from "react";
import type { Player, Team } from "@/lib/fpl/types";
import { POSITION_LABELS, formatPrice } from "@/lib/fpl/constants";

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 25;

interface Props {
  allPlayers: Player[];
  teams: Team[];
  excludeIds: Set<number>;
  onSelect: (id: number) => void;
  disabled: boolean;
}

export default function PlayerSearchCombobox({
  allPlayers,
  teams,
  excludeIds,
  onSelect,
  disabled,
}: Props) {
  const [query, setQuery] = useState("");

  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < MIN_QUERY_LENGTH) return [];

    return allPlayers
      .filter((p) => !excludeIds.has(p.id))
      .filter((p) => {
        const team = teamsById.get(p.team);
        return (
          p.webName.toLowerCase().includes(q) ||
          team?.shortName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.selectedByPercent - a.selectedByPercent)
      .slice(0, MAX_RESULTS);
  }, [query, allPlayers, excludeIds, teamsById]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        disabled={disabled}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          disabled ? "Squad full — remove a player to swap" : "Search a player to add…"
        }
        className="w-full border border-zinc-300 px-4 py-3 text-base text-foreground placeholder:text-zinc-400 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:bg-zinc-50 disabled:text-zinc-400"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto border border-zinc-200 bg-white shadow-sm">
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
