import type { Player, Team } from "@/lib/fpl/types";
import { POSITION_LABELS, formatPrice } from "@/lib/fpl/constants";

interface Props {
  squadPlayers: Player[];
  teams: Team[];
  onRemove: (id: number) => void;
}

export default function SquadList({ squadPlayers, teams, onRemove }: Props) {
  if (squadPlayers.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500">
        Search above to add your 15 players.
      </p>
    );
  }

  const teamsById = new Map(teams.map((t) => [t.id, t]));

  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-[10px] border border-zinc-200">
      {squadPlayers.map((p) => {
        const team = teamsById.get(p.team);
        return (
          <li key={p.id} className="flex items-center justify-between py-1 pl-4 pr-1">
            <div>
              <p className="text-sm font-medium text-foreground">{p.webName}</p>
              <p className="text-xs text-zinc-500">
                {POSITION_LABELS[p.elementType]} · {team?.shortName ?? "?"} ·{" "}
                {formatPrice(p.nowCost)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(p.id)}
              aria-label={`Remove ${p.webName}`}
              className="px-3 py-3.5 text-zinc-400 transition-colors hover:text-risk"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
