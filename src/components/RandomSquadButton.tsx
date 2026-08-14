"use client";

import { useState } from "react";
import type { Player } from "@/lib/fpl/types";
import { generateRandomSquad } from "@/lib/fpl/randomSquad";

interface Props {
  allPlayers: Player[];
  onGenerate: (ids: number[]) => void;
}

export default function RandomSquadButton({ allPlayers, onGenerate }: Props) {
  const [failed, setFailed] = useState(false);

  const handleClick = () => {
    const squad = generateRandomSquad(allPlayers);
    if (!squad) {
      setFailed(true);
      return;
    }
    setFailed(false);
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
