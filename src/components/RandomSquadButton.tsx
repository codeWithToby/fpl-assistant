"use client";

import { useState } from "react";
import type { BudgetStyle, FormBias, Player, SquadFilters, StarterReliability, TeamFocus } from "@/lib/fpl/types";
import { DEFAULT_SQUAD_FILTERS } from "@/lib/fpl/constants";
import { generateRandomSquad } from "@/lib/fpl/randomSquad";
import { track } from "@/lib/analytics/track";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  allPlayers: Player[];
  onGenerate: (ids: number[]) => void;
  hasSquad: boolean;
  finishedGameweekCount: number;
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
              value === opt.value
                ? "bg-brand text-white dark:bg-pitch dark:text-brand"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RandomSquadButton({
  allPlayers,
  onGenerate,
  hasSquad,
  finishedGameweekCount,
}: Props) {
  const [failed, setFailed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [filters, setFilters] = useState<SquadFilters>(DEFAULT_SQUAD_FILTERS);

  const generate = () => {
    const squad = generateRandomSquad(allPlayers, finishedGameweekCount, filters);
    if (!squad) {
      setFailed(true);
      return;
    }
    setFailed(false);
    track("random_squad_used");
    onGenerate(squad);
  };

  const handleClick = () => {
    if (hasSquad) {
      setShowConfirm(true);
      return;
    }
    generate();
  };

  return (
    <div>
      {showConfirm && (
        <ConfirmDialog
          message="Replace your current squad with a random one? This can't be undone."
          onConfirm={() => {
            setShowConfirm(false);
            generate();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          className="flex-1 rounded-[10px] border border-brand-light px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-light transition-colors hover:bg-brand-light hover:text-white dark:border-pitch dark:text-pitch dark:hover:bg-pitch dark:hover:text-brand"
        >
          Random squad
        </button>
        <button
          type="button"
          onClick={() => setShowCustomize((v) => !v)}
          className="text-xs font-bold uppercase tracking-wide text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
        >
          {showCustomize ? "Hide customize" : "Customize"}
        </button>
      </div>

      {failed && (
        <p className="mt-1.5 text-xs text-risk">
          Couldn&apos;t generate a valid squad — try again.
        </p>
      )}

      {showCustomize && (
        <div className="mt-3 flex flex-col gap-3 rounded-[10px] border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
          <FilterGroup<BudgetStyle>
            label="Budget style"
            value={filters.budgetStyle}
            onChange={(budgetStyle) => setFilters((f) => ({ ...f, budgetStyle }))}
            options={[
              { value: "balanced", label: "Balanced" },
              { value: "starsAndScrubs", label: "Stars & Scrubs" },
              { value: "valueHunters", label: "Value Hunters" },
            ]}
          />
          <FilterGroup<StarterReliability>
            label="Starter reliability"
            value={filters.starterReliability}
            onChange={(starterReliability) => setFilters((f) => ({ ...f, starterReliability }))}
            options={[
              { value: "nailedOnOnly", label: "Nailed-on only" },
              { value: "mixRisk", label: "Mix in rotation risk" },
            ]}
          />
          <FilterGroup<FormBias>
            label="Form bias"
            value={filters.formBias}
            onChange={(formBias) => setFilters((f) => ({ ...f, formBias }))}
            options={[
              { value: "inForm", label: "In-form picks" },
              { value: "ignoreForm", label: "Ignore form" },
            ]}
          />
          <FilterGroup<TeamFocus>
            label="Team focus"
            value={filters.teamFocus}
            onChange={(teamFocus) => setFilters((f) => ({ ...f, teamFocus }))}
            options={[
              { value: "balanced", label: "Balanced" },
              { value: "attackHeavy", label: "Attack-heavy" },
              { value: "defenseHeavy", label: "Defense-heavy" },
            ]}
          />

          {filters.budgetStyle === "starsAndScrubs" && filters.teamFocus === "defenseHeavy" && (
            <p className="text-[11px] leading-relaxed text-zinc-400">
              Premium picks are naturally cheaper at the back — expect a milder
              &quot;stars&quot; effect than an attack-focused squad.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
