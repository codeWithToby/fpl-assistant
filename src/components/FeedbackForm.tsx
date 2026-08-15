"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("loading");

    const { error } = await supabase.from("feedback").insert({
      message: message.trim(),
      email: email.trim() || null,
    });

    if (error) {
      setStatus("error");
      return;
    }

    setStatus("success");
    setMessage("");
    setEmail("");
  }

  if (status === "success") {
    return (
      <div className="rounded-[10px] border border-brand-light bg-pitch-soft px-6 py-8 text-center">
        <p className="text-sm font-semibold text-foreground">
          Thanks — we read every note.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={5}
        placeholder="Bug, feature idea, or just what's working — tell us."
        className="rounded-[10px] border border-zinc-300 px-3 py-2.5 text-sm text-foreground placeholder:text-zinc-400 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 dark:border-zinc-700"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email (optional, if you'd like a reply)"
        className="rounded-[10px] border border-zinc-300 px-3 py-2.5 text-sm text-foreground placeholder:text-zinc-400 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 dark:border-zinc-700"
      />
      <button
        type="submit"
        disabled={status === "loading" || !message.trim()}
        className="rounded-[10px] bg-brand-light px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send feedback"}
      </button>
      {status === "error" && (
        <p className="text-xs text-risk">Something went wrong — try again.</p>
      )}
    </form>
  );
}
