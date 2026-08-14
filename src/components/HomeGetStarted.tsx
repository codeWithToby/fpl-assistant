import Link from "next/link";
import type { Player } from "@/lib/fpl/types";
import RandomSquadButton from "./RandomSquadButton";

interface Props {
  allPlayers: Player[];
  onGenerate: (ids: number[]) => void;
}

export default function HomeGetStarted({ allPlayers, onGenerate }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-[10px] bg-background p-6 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]">
      <div>
        <p className="text-sm font-semibold text-foreground">No squad yet</p>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your real 15, or generate a random squad to see how it works.
        </p>
      </div>

      <Link
        href="/squad"
        className="rounded-[10px] bg-brand-light px-6 py-3 text-center text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand"
      >
        Enter your squad
      </Link>

      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        or
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <RandomSquadButton allPlayers={allPlayers} onGenerate={onGenerate} />
    </div>
  );
}
