"use client";

import { useState } from "react";
import type { Player } from "@/lib/fpl/types";
import { generateRandomSquad } from "@/lib/fpl/randomSquad";
import { track } from "@/lib/analytics/track";

interface Props {
  allPlayers: Player[];
  onGenerate: (ids: number[]) => void;
  hasSquad: boolean;
}

export default function RandomSquadButton({ allPlayers, onGenerate, hasSquad }: Props) {
  const [failed, setFailed] = useState(false);

  const handleClick = () => {
    if (hasSquad && !window.confirm("Replace your current squad with a random one? This can't be undone.")) {
      return;
    }

    const squad = generateRandomSquad(allPlayers);
    if (!squad) {
      setFailed(true);
      return;
    }
    setFailed(false);
    track("random_squad_used");
    onGenerate(squad);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-[10px] border border-brand-light px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-light transition-colors hover:bg-brand-light hover:text-white"
      >
        Random squad
      </button>
      {failed && (
        <p className="mt-1.5 text-xs text-risk">
          Couldn&apos;t generate a valid squad — try again.
        </p>
      )}
    </div>
  );
}
