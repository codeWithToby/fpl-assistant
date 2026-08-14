"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "fpl-assistant:squad";
export const MAX_SQUAD_SIZE = 15;

export function useSquadSelection() {
  const [squadIds, setSquadIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

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

  const addPlayer = useCallback((id: number) => {
    setSquadIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX_SQUAD_SIZE) return prev;
      return [...prev, id];
    });
  }, []);

  const removePlayer = useCallback((id: number) => {
    setSquadIds((prev) => prev.filter((pid) => pid !== id));
  }, []);

  return {
    squadIds,
    addPlayer,
    removePlayer,
    isFull: squadIds.length >= MAX_SQUAD_SIZE,
  };
}
