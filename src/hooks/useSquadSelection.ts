"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Player } from "@/lib/fpl/types";
import { SQUAD_BUDGET, SQUAD_POSITION_NEEDS } from "@/lib/fpl/constants";

const STORAGE_KEY = "fpl-assistant:squad";
export const MAX_SQUAD_SIZE = 15;

export function useSquadSelection(allPlayers: Player[]) {
  const [squadIds, setSquadIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const playersById = useMemo(() => {
    const map = new Map<number, Player>();
    allPlayers.forEach((p) => map.set(p.id, p));
    return map;
  }, [allPlayers]);

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

        const player = playersById.get(id);
        if (!player) return prev;

        // Enforce real FPL squad shape (2 GK / 5 DEF / 5 MID / 3 FWD) on
        // every add, not just the random/import bulk-replace paths — a
        // position-count pitch view can't stay correct if a 6th defender
        // could sneak in through the plain search box.
        const cap = SQUAD_POSITION_NEEDS[player.elementType];
        const currentCount = prev.filter(
          (pid) => elementTypeById.get(pid) === player.elementType
        ).length;
        if (cap !== undefined && currentCount >= cap) return prev;

        // Same for the real £100m budget — only the random generator
        // respected it before, so a hand-built squad could go over with
        // no warning and no way the squad could ever exist in real FPL.
        const currentSpend = prev.reduce(
          (sum, pid) => sum + (playersById.get(pid)?.nowCost ?? 0),
          0
        );
        if (currentSpend + player.nowCost > SQUAD_BUDGET) return prev;

        return [...prev, id];
      });
    },
    [elementTypeById, playersById]
  );

  const removePlayer = useCallback((id: number) => {
    setSquadIds((prev) => prev.filter((pid) => pid !== id));
  }, []);

  const replaceSquad = useCallback((ids: number[]) => {
    setSquadIds(ids);
  }, []);

  const remainingBudget = useMemo(
    () =>
      SQUAD_BUDGET -
      squadIds.reduce((sum, id) => sum + (playersById.get(id)?.nowCost ?? 0), 0),
    [squadIds, playersById]
  );

  return {
    squadIds,
    addPlayer,
    removePlayer,
    replaceSquad,
    isFull: squadIds.length >= MAX_SQUAD_SIZE,
    remainingBudget,
    hydrated,
  };
}
