"use client";

import { useEffect, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics/track";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  currentGameweekId: number | null;
  deadlineTime: string | null;
  onImport: (ids: number[]) => void;
  hasSquad: boolean;
}

export default function ImportSquadForm({
  currentGameweekId,
  deadlineTime,
  onImport,
  hasSquad,
}: Props) {
  const [teamId, setTeamId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingImport, setPendingImport] = useState<number[] | null>(null);

  // Computed client-side after mount, same as DeadlineBadge — avoids a
  // server/client clock mismatch, and the server never renders a value
  // for this anyway.
  const [isPreDeadline, setIsPreDeadline] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPreDeadline(deadlineTime ? new Date(deadlineTime).getTime() > Date.now() : false);
  }, [deadlineTime]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const id = Number(teamId.trim());
    if (!Number.isInteger(id) || id <= 0) {
      setStatus("error");
      setErrorMessage("Enter a valid Team ID.");
      return;
    }
    if (!currentGameweekId) {
      setStatus("error");
      setErrorMessage("Can't tell which gameweek to import right now.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/fpl/entry/${id}?event=${currentGameweekId}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong.");
        return;
      }

      if (hasSquad) {
        setPendingImport(data.playerIds);
        setStatus("idle");
        return;
      }

      track("import_squad_used");
      onImport(data.playerIds);
      setStatus("idle");
      setTeamId("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong — try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
      {pendingImport && (
        <ConfirmDialog
          message="Replace your current squad with the imported one? This can't be undone."
          onConfirm={() => {
            track("import_squad_used");
            onImport(pendingImport);
            setPendingImport(null);
            setTeamId("");
          }}
          onCancel={() => setPendingImport(null)}
        />
      )}
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          placeholder="Your Team ID"
          className="min-w-0 flex-1 rounded-[10px] border border-zinc-300 px-3 py-2 text-sm text-foreground placeholder:text-zinc-400 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-none rounded-[10px] bg-brand-light px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand disabled:opacity-60"
        >
          {status === "loading" ? "Importing…" : "Import"}
        </button>
      </div>

      {status === "error" && <p className="text-xs text-risk">{errorMessage}</p>}

      {isPreDeadline && status !== "error" && (
        <p className="text-xs text-amber-600 dark:text-amber-500">
          FPL hides everyone&apos;s picks until the deadline passes — Import won&apos;t work
          until then. Build your squad manually for now.
        </p>
      )}

      <p className="text-xs text-zinc-400">
        Find your Team ID in the URL when you view your team on the official FPL site.
      </p>
    </form>
  );
}
