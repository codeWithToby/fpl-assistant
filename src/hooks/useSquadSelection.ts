"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Player } from "@/lib/fpl/types";
import { SQUAD_POSITION_NEEDS } from "@/lib/fpl/constants";

const STORAGE_KEY = "fpl-assistant:squad";
export const MAX_SQUAD_SIZE = 15;

export function useSquadSelection(allPlayers: Player[]) {
  const [squadIds, setSquadIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const elementTypeById = useMemo(() => {
    const map = new Map<number, number>();
    allPlayers.forEach((p) => map.set(p.id, p.elementType));
    return map;
  }, [allPlayers]);

  // Restore from localStorage after mount only — reading window during the
  // server render pass of this client component would throw.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.every((id) => typeof id === "number")) {
        setSquadIds(parsed);
      }
    } catch {
      // corrupt/blocked storage — just start empty
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(squadIds));
  }, [squadIds, hydrated]);

  const addPlayer = useCallback(
    (id: number) => {
      setSquadIds((prev) => {
        if (prev.includes(id) || prev.length >= MAX_SQUAD_SIZE) return prev;

        // Enforce real FPL squad shape (2 GK / 5 DEF / 5 MID / 3 FWD) on
        // every add, not just the random/import bulk-replace paths — a
        // position-count pitch view can't stay correct if a 6th defender
        // could sneak in through the plain search box.
        const elementType = elementTypeById.get(id);
        if (elementType === undefined) return prev;
        const cap = SQUAD_POSITION_NEEDS[elementType];
        const currentCount = prev.filter((pid) => elementTypeById.get(pid) === elementType).length;
        if (cap !== undefined && currentCount >= cap) return prev;

        return [...prev, id];
      });
    },
    [elementTypeById]
  );

  const removePlayer = useCallback((id: number) => {
    setSquadIds((prev) => prev.filter((pid) => pid !== id));
  }, []);

  const replaceSquad = useCallback((ids: number[]) => {
    setSquadIds(ids);
  }, []);

  return {
    squadIds,
    addPlayer,
    removePlayer,
    replaceSquad,
    isFull: squadIds.length >= MAX_SQUAD_SIZE,
  };
}
