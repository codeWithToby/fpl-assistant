import Link from "next/link";
import { MAX_SQUAD_SIZE } from "@/hooks/useSquadSelection";

export default function HomeSquadInProgress({ count }: { count: number }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 rounded-[10px] border border-dashed border-zinc-300 p-6 text-center">
      <p className="text-sm font-semibold text-foreground">
        Squad in progress — {count}/{MAX_SQUAD_SIZE} players added
      </p>
      <Link
        href="/squad"
        className="mx-auto text-sm font-bold text-brand-light hover:text-brand"
      >
        Continue building your squad →
      </Link>
    </div>
  );
}
