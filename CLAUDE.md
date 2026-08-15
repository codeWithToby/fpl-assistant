# Project: Armband — FPL Captain Assistant

Product name is **Armband** (renamed from "FPL Assistant"). The repo, npm
package, GitHub repo, and Vercel project all still use the old
`fpl-assistant` identifier — that's an infrastructure name, not the brand,
and hasn't been renamed. User-facing text should always say "Armband."

## Stack
- Next.js (App Router)
- Tailwind CSS
- Supabase (store gameweek snapshots, user's saved squad — no auth needed for v1, just local squad input)
- Deploy target: Vercel

## Data source
Official FPL API (`https://fantasy.premierleague.com/api/`) — free, public, no key. It's CORS-blocked, so all calls go through Next.js API routes (server-side), never direct from the browser.

Key endpoints:
- `bootstrap-static/` — all players, teams, prices, ownership, form, and `expected_goals`, `expected_assists`, `expected_goal_involvements` per player
- `fixtures/` — full fixture list with `team_h_difficulty` / `team_a_difficulty` (FDR)
- `element-summary/{player_id}/` — per-player fixture-by-fixture history and upcoming run

Cache `bootstrap-static` responses for ~1 hour, it's a heavy payload and doesn't change that often.

## Core features (v1 — keep this tight)
1. Squad input — user enters their 15 players (searchable dropdown from bootstrap-static)
2. Captain recommender — ranks the user's squad for captaincy by combining:
   - xG + xA over next fixture
   - fixture difficulty (FDR) for that gameweek
   - recent form (last 4-5 gameweeks)
   Show the reasoning, not just a name — this is the differentiator, most tools show stats and leave the decision to the user, we make the call and explain it.
3. Triple captain flag — if the top recommendation clears a threshold (e.g. easy fixture + high xGI + strong form), flag it as a Triple Captain candidate for the week
4. Clean sheet probability — for defenders/GK in the squad, using FDR + underlying defensive stats
5. Simple optimal XI — given the 15-man squad, suggest the best starting 11
   - formation for the gameweek based on combined predicted output

## Explicitly out of scope for v1
No auth, no mini-leagues, no transfer planner, no price change predictor, no wildcard/chip strategy beyond the triple captain flag above. Ship the captain decision engine first, expand after.

## Conventions
- Mobile-first — this gets checked on phones during the pre-deadline scramble
- Show the "why" behind every recommendation, not just a ranked list
- Data-dense but not cluttered — this is a decision tool, not a dashboard
- Follow the `frontend-design` skill (~/.claude/skills/frontend-design) for any UI/styling work — intentional typography and spacing, restrained purposeful color, no generic AI-default layouts

## Analytics
- Vercel Web Analytics — baseline traffic (visitors, DAU, page views), enabled in the Vercel dashboard
- Supabase `events` table (see `supabase-schema.sql`) — product-level tracking, since there's no auth to key off of. Anonymous per-browser ID (localStorage, `src/lib/analytics/track.ts`), fire-and-forget inserts, RLS restricts the anon key to insert-only. Events: `squad_completed`, `captain_recommendation_viewed`, `random_squad_used`, `import_squad_used`.
- Site-wide footer (`src/components/Footer.tsx`) carries a one-line note that anonymous analytics are collected — keep this in sync if the analytics scope ever changes.

## Feedback
- `/feedback` (was `/contact`) — a form (`src/components/FeedbackForm.tsx`) that writes straight to the Supabase `feedback` table (message, optional email). Insert-only RLS, same pattern as `events`. No confirmation email is sent — check the table directly.

## Deploy
- Push to GitHub, deploy via Vercel MCP
- Supabase table: `squad_snapshots` (gameweek, squad_json, created_at) if we want to save/reload squads later — optional for v1
- Supabase table: `events` (anon_id, event_name, metadata, created_at) — already added, see Analytics above
- Supabase table: `feedback` (message, email, created_at) — already added, see Feedback above
