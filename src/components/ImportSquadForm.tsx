"use client";

import { useState, type FormEvent } from "react";

interface Props {
  currentGameweekId: number | null;
  onImport: (ids: number[]) => void;
}

export default function ImportSquadForm({ currentGameweekId, onImport }: Props) {
  const [teamId, setTeamId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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

      <p className="text-xs text-zinc-400">
        Find your Team ID in the URL when you view your team on the official FPL site.
      </p>
    </form>
  );
}
