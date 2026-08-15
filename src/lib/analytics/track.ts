"use client";

import { supabase } from "@/lib/supabase";

const ANON_ID_KEY = "fpl-assistant:anon-id";
let cachedAnonId: string | null = null;

function getAnonId(): string {
  if (cachedAnonId) return cachedAnonId;
  try {
    const existing = window.localStorage.getItem(ANON_ID_KEY);
    if (existing) {
      cachedAnonId = existing;
      return existing;
    }
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(ANON_ID_KEY, fresh);
    cachedAnonId = fresh;
    return fresh;
  } catch {
    // localStorage blocked (private mode etc.) — fall back to an
    // ephemeral id for this page load only; never let analytics break the app.
    cachedAnonId ??= crypto.randomUUID();
    return cachedAnonId;
  }
}

export function track(eventName: string, metadata: Record<string, unknown> = {}) {
  try {
    void supabase
      .from("events")
      .insert({ anon_id: getAnonId(), event_name: eventName, metadata })
      .then(({ error }) => {
        if (error && process.env.NODE_ENV !== "production") {
          console.warn("[analytics] track failed:", eventName, error.message);
        }
      });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] track threw:", eventName, err);
    }
  }
}
