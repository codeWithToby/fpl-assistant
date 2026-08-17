import { z } from "zod";

// Runtime schemas for FPL's unofficial API responses. This is a real risk
// surface, not a formality: there's no published contract, the community
// has reverse-engineered these shapes, and field names have been known to
// shift between seasons. Validating at the fetch boundary means a schema
// change fails loudly and specifically (which field, what was expected)
// right where the data enters the app, instead of silently propagating
// `undefined`/`NaN` into scoring math and producing wrong-but-confident
// captain recommendations with no error anywhere.
//
// Scope is deliberately narrow: only the fields this app actually reads
// (matching the existing Raw* trimming) are validated — not the full
// upstream payload. `status` stays a loose string rather than a strict
// enum of known codes, since FPL introducing a new status value is a
// real possibility and shouldn't fail an entire fetch over one field
// whose unknown values our own code already treats as a safe default.
//
// A validation failure throws, same as a network error — both are
// "the live fetch failed" as far as fetchWithFallback.ts is concerned,
// so a schema drift degrades to serving last-known-good data rather
// than crashing the app.

export const rawPlayerSchema = z.object({
  id: z.number(),
  web_name: z.string(),
  team: z.number(),
  element_type: z.number(),
  now_cost: z.number(),
  minutes: z.number(),
  form: z.string(),
  selected_by_percent: z.string(),
  expected_goals_per_90: z.number(),
  expected_assists_per_90: z.number(),
  expected_goal_involvements_per_90: z.number(),
  expected_goals_conceded_per_90: z.number(),
  status: z.string(),
  chance_of_playing_next_round: z.number().nullable(),
  total_points: z.number(),
});

export const rawTeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  short_name: z.string(),
});

export const rawEventSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_current: z.boolean(),
  is_next: z.boolean(),
  finished: z.boolean(),
  deadline_time: z.string(), // ISO 8601, UTC
});

export const rawElementTypeSchema = z.object({
  id: z.number(),
  singular_name: z.string(),
  squad_select: z.number(),
});

export const rawBootstrapSchema = z.object({
  elements: z.array(rawPlayerSchema),
  teams: z.array(rawTeamSchema),
  events: z.array(rawEventSchema),
  element_types: z.array(rawElementTypeSchema),
});

export const rawFixtureSchema = z.object({
  id: z.number(),
  event: z.number().nullable(),
  kickoff_time: z.string().nullable(),
  started: z.boolean(),
  finished: z.boolean(),
  team_h: z.number(),
  team_a: z.number(),
  team_h_difficulty: z.number(),
  team_a_difficulty: z.number(),
});

export const rawFixturesSchema = z.array(rawFixtureSchema);

export const rawPicksResponseSchema = z.object({
  picks: z.array(z.object({ element: z.number() })),
});

// element-summary's per-gameweek history — expected_goal_involvements/
// expected_goals_conceded here are per-MATCH totals (strings, like form/
// selected_by_percent elsewhere), not the per-90 rates bootstrap-static
// gives — recentForm.ts derives per-90 from these itself.
export const rawElementHistoryEntrySchema = z.object({
  round: z.number(),
  minutes: z.number(),
  expected_goal_involvements: z.string(),
  expected_goals_conceded: z.string(),
});

export const rawElementSummarySchema = z.object({
  history: z.array(rawElementHistoryEntrySchema),
});

export type RawPlayer = z.infer<typeof rawPlayerSchema>;
export type RawTeam = z.infer<typeof rawTeamSchema>;
export type RawEvent = z.infer<typeof rawEventSchema>;
export type RawElementType = z.infer<typeof rawElementTypeSchema>;
export type RawBootstrap = z.infer<typeof rawBootstrapSchema>;
export type RawFixture = z.infer<typeof rawFixtureSchema>;
export type RawPicksResponse = z.infer<typeof rawPicksResponseSchema>;
export type RawElementHistoryEntry = z.infer<typeof rawElementHistoryEntrySchema>;
export type RawElementSummary = z.infer<typeof rawElementSummarySchema>;

// Validates `json` against `schema`, logging exactly which field(s) broke
// before throwing a short, catchable error — callers don't need to know
// anything about Zod, they just get "this response didn't match what we
// expected" the same as any other fetch failure.
export function parseOrThrow<T>(schema: z.ZodType<T>, json: unknown, context: string): T {
  const result = schema.safeParse(json);
  if (!result.success) {
    console.error(`[fpl] ${context} response failed schema validation:`, result.error.issues);
    throw new Error(`FPL ${context} response did not match the expected schema`);
  }
  return result.data;
}
