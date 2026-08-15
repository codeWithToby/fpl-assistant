"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Player, RecentFormStats } from "@/lib/fpl/types";
import { applyRecentForm } from "@/lib/fpl/recentForm";

// Fetches recent-form stats for squad players only (never the full
// 600+ player pool), caching per player ID for the session — a failed
// or not-yet-fetched player just falls through to season-to-date data,
// so this can never block or break the recommendations it's refining.
export function useRecentForm(squadPlayers: Player[]): Player[] {
  const [cache, setCache] = useState<Map<number, RecentFormStats>>(new Map());
  const requestedIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const idsToFetch = squadPlayers
      .map((p) => p.id)
      .filter((id) => !requestedIds.current.has(id));

    if (idsToFetch.length === 0) return;
    idsToFetch.forEach((id) => requestedIds.current.add(id));

    let cancelled = false;

    Promise.all(
      idsToFetch.map(async (id) => {
        try {
          const res = await fetch(`/api/fpl/element-summary/${id}`);
          if (!res.ok) return null;
          const data = (await res.json()) as RecentFormStats;
          return [id, data] as const;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const successes = results.filter((r): r is readonly [number, RecentFormStats] => r !== null);
      if (successes.length === 0) return;
      setCache((prev) => {
        const next = new Map(prev);
        successes.forEach(([id, data]) => next.set(id, data));
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [squadPlayers]);

  return useMemo(
    () =>
      squadPlayers.map((p) => {
        const recent = cache.get(p.id);
        return recent ? applyRecentForm(p, recent) : p;
      }),
    [squadPlayers, cache]
  );
}
