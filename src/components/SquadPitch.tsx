import type { Player, Team } from "@/lib/fpl/types";
import { POSITION_LABELS } from "@/lib/fpl/constants";

const GK = 1;
const DEF = 2;
const MID = 3;
const FWD = 4;

// A fixed 4-4-2 shape for the build-phase pitch — not the stats-optimized
// formation Optimal XI computes once the squad's complete, just a stable
// frame to fill while assembling the 15. Pitch + bench capacity per
// position always sums to the real squad limits (2 GK / 5 DEF / 5 MID /
// 3 FWD), so this never has to guess or overflow.
const PITCH_CAPACITY: Record<number, number> = { [GK]: 1, [DEF]: 4, [MID]: 4, [FWD]: 2 };
const BENCH_CAPACITY: Record<number, number> = { [GK]: 1, [DEF]: 1, [MID]: 1, [FWD]: 1 };
const PITCH_ROW_ORDER = [FWD, MID, DEF, GK] as const;
const BENCH_ORDER = [GK, DEF, MID, FWD] as const;

interface Slot {
  type: number;
  player: Player | null;
}

function buildPitchSlotsByType(squadPlayers: Player[]): Record<number, Slot[]> {
  const result: Record<number, Slot[]> = {};
  for (const type of [GK, DEF, MID, FWD]) {
    const players = squadPlayers.filter((p) => p.elementType === type);
    result[type] = Array.from({ length: PITCH_CAPACITY[type] }, (_, i) => ({
      type,
      player: players[i] ?? null,
    }));
  }
  return result;
}

function buildBenchSlots(squadPlayers: Player[]): Slot[] {
  const slots: Slot[] = [];
  for (const type of BENCH_ORDER) {
    const players = squadPlayers.filter((p) => p.elementType === type);
    const pitchCount = PITCH_CAPACITY[type];
    for (let i = 0; i < BENCH_CAPACITY[type]; i++) {
      slots.push({ type, player: players[pitchCount + i] ?? null });
    }
  }
  return slots;
}

function FilledSlot({
  player,
  team,
  onRemove,
}: {
  player: Player;
  team: Team | undefined;
  onRemove: (id: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onRemove(player.id)}
      aria-label={`Remove ${player.webName}`}
      className="flex w-14 flex-col items-center gap-0.5 rounded-[8px] bg-white px-1 py-1.5 text-center shadow-[0_4px_10px_-4px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.04] active:scale-95 sm:w-16"
    >
      <span className="text-[10px] font-bold leading-tight text-brand sm:text-[11px]">
        {player.webName}
      </span>
      <span className="text-[8px] font-medium text-zinc-500 sm:text-[9px]">
        {team?.shortName ?? "?"}
      </span>
    </button>
  );
}

function EmptySlot({
  type,
  variant,
  onClick,
}: {
  type: number;
  variant: "pitch" | "bench";
  onClick: (type: number) => void;
}) {
  const style =
    variant === "pitch"
      ? "border-white/50 text-white/80 hover:border-white hover:bg-white/10"
      : "border-zinc-300 text-zinc-400 hover:border-brand-light hover:text-brand-light dark:border-zinc-600 dark:text-zinc-500 dark:hover:border-pitch dark:hover:text-pitch";

  return (
    <button
      type="button"
      onClick={() => onClick(type)}
      aria-label={`Add ${POSITION_LABELS[type]} player`}
      className={`flex w-14 flex-col items-center justify-center gap-0.5 rounded-[8px] border-2 border-dashed py-2.5 transition-colors sm:w-16 ${style}`}
    >
      <span className="text-sm leading-none">+</span>
      <span className="text-[9px] font-bold uppercase tracking-wide">{POSITION_LABELS[type]}</span>
    </button>
  );
}

interface Props {
  squadPlayers: Player[];
  teams: Team[];
  onSlotClick: (type: number) => void;
  onRemove: (id: number) => void;
}

export default function SquadPitch({ squadPlayers, teams, onSlotClick, onRemove }: Props) {
  const teamsById = new Map(teams.map((t) => [t.id, t]));
  const pitchByType = buildPitchSlotsByType(squadPlayers);
  const benchSlots = buildBenchSlots(squadPlayers);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative min-h-[300px] overflow-hidden rounded-[10px] border-2 border-white/25 p-3"
        style={{
          background:
            "repeating-linear-gradient(180deg, var(--grass) 0px, var(--grass) 10px, var(--grass-dark) 10px, var(--grass-dark) 20px)",
        }}
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/20" />

        <div className="relative flex h-full min-h-[264px] flex-col justify-between py-2">
          {PITCH_ROW_ORDER.map((type) => (
            <div key={type} className="flex flex-wrap items-start justify-evenly gap-2">
              {pitchByType[type].map((slot, i) =>
                slot.player ? (
                  <FilledSlot
                    key={slot.player.id}
                    player={slot.player}
                    team={teamsById.get(slot.player.team)}
                    onRemove={onRemove}
                  />
                ) : (
                  <EmptySlot key={`${type}-${i}`} type={type} variant="pitch" onClick={onSlotClick} />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Bench
        </p>
        <div className="flex flex-wrap justify-evenly gap-2 rounded-[10px] border border-zinc-200 bg-background p-3 dark:border-zinc-700">
          {benchSlots.map((slot, i) =>
            slot.player ? (
              <FilledSlot
                key={slot.player.id}
                player={slot.player}
                team={teamsById.get(slot.player.team)}
                onRemove={onRemove}
              />
            ) : (
              <EmptySlot key={`bench-${i}`} type={slot.type} variant="bench" onClick={onSlotClick} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
