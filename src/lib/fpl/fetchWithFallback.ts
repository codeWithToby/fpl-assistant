export interface FetchResult<T> {
  data: T;
  stale: boolean;
  fetchedAt: number; // epoch ms of the last successful fetch
}

// Wraps a fetcher with an explicit last-known-good fallback, so a
// transient FPL outage or an undocumented rate-limit block degrades to
// re-serving the most recent successful response instead of crashing the
// page. This sits on top of Next's own shared fetch Data Cache (the
// primary caching layer, configured via `next: { revalidate }` in the
// wrapped fetcher) — that layer is what keeps request volume to FPL flat
// regardless of user count. This wrapper adds the piece Next's cache
// doesn't give us on its own: an explicit `stale` signal our own code can
// act on (show a banner, log it) rather than silently trusting opaque
// cache internals to have done the right thing.
//
// Persistence is per server instance (a module-scope closure), not a
// durable cross-instance store — acceptable here because Next's Data
// Cache is the durable layer; this is a defence-in-depth safety net for
// the case where a fetch call itself throws (network error, non-2xx,
// or a cold instance with no cache entry yet).
export function withFallback<T>(fetcher: () => Promise<T>) {
  let cached: { data: T; fetchedAt: number } | null = null;

  return async function fetchWithFallback(): Promise<FetchResult<T>> {
    try {
      const data = await fetcher();
      cached = { data, fetchedAt: Date.now() };
      return { data, stale: false, fetchedAt: cached.fetchedAt };
    } catch (err) {
      if (cached) {
        return { data: cached.data, stale: true, fetchedAt: cached.fetchedAt };
      }
      throw err; // nothing to fall back to — genuinely nothing we can show
    }
  };
}
