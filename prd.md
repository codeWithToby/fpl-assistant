# PRD: FPL Optimal Team Assistant

## Problem Statement

FPL has 12M+ active managers making high-stakes weekly decisions (captain, transfers, chip timing) under time pressure before each deadline. The existing tool landscape (FPL Pulse, Fantasy Football Fix, LiveFPL, Fine Line) mostly hands users more data — xPts tables, FDR grids, ownership charts — and leaves the actual decision to them. That's a dashboard problem, not a decision problem: users still have to synthesize five data points into one captain call themselves, often under deadline pressure with incomplete attention.

The cost of not solving this: managers make suboptimal captain/transfer calls not from lack of data but from lack of synthesis, directly costing them rank in a game where a single missed captain pick can cost hundreds of thousands of global ranking positions.

## Goals

1. User can get a specific, reasoned recommendation (not a data table) for captain, transfer, and chip decisions in under 2 minutes per gameweek
2. Recommendation engine outperforms "gut feel" captaincy — track user's captain points vs. average FPL captain points as a running delta
3. Users return weekly (retention is the real signal this solves a recurring pain, not a one-time curiosity)
4. Every recommendation is explainable in one sentence a non-technical user understands ("X is nailed-on, faces the league's easiest defense, and is in the best form of any midfielder")

## Non-Goals

- **Live gameweek score tracking** — LiveFPL and the official app already do this well, not a differentiated place to spend effort
- **Mini-league features** (standings, rival tracking, head-to-head) — social features are a different product surface, revisit post-validation of the core recommendation engine
- **Full auth/account system in v1** — adds scope before we know the recommendation engine itself is valuable; local/session-based squad entry is enough to validate
- **Price change prediction** — well-served by existing tools, and it's a data-display feature, not a decision — doesn't fit the "clear recommendation" thesis
- **General news/injury aggregation** — high maintenance burden (constant scraping/curation), not core to the recommendation engine itself; can integrate a third-party feed later rather than build

## User Stories

- As a new user, I want to try the tool with a randomly generated squad, so that I can see how the recommendation engine works before entering my actual 15 players
- As an FPL manager, I want to be told who to captain and why, so that I don't have to cross-reference five stats myself before every deadline
- As an FPL manager, I want to know if this is a Triple Captain week for my best asset, so that I use my one-time chip at its highest-value moment instead of guessing
- As an FPL manager, I want my starting XI picked for me from my 15-man squad, so that I don't accidentally bench a nailed starter
- As an FPL manager, I want transfer suggestions that weigh my budget and free transfers, so that I know if a move is actually worth a hit or not
- As an FPL manager, I want to know when to play a chip (Wildcard, Bench Boost, Free Hit), so that I'm not guessing timing based on Reddit threads
- As an FPL manager entering a differential, I want to see low-ownership players the model rates highly, so that I can find rank-swinging picks, not just template ones
- As an FPL manager, I want to see the reasoning behind a recommendation, not just accept a black box, so that I can apply my own judgment on injury news the model can't see

## Requirements

### Must-Have (P0) — this is v1, already scoped
- [ ] Squad input (15-man squad entry, searchable player picker from bootstrap-static)
- [ ] "Random squad" option: generates a valid 15-man squad (budget-compliant, position-compliant, max 3 per team) on demand, so a user can see a recommendation before entering their real team
- [ ] Captain recommender: ranks squad by xG/xA + fixture difficulty + form, outputs one clear pick with a one-sentence reason
- [ ] Triple Captain flag: surfaces when the top pick clears a high-confidence threshold
- [ ] Clean sheet probability for defenders/GK in squad
- [ ] Optimal starting XI + formation suggestion from the 15-man squad

Acceptance criteria:
- Given a valid 15-man squad, when the user opens the app pre-deadline, then they see one captain recommendation with a plain-language reason, not a ranked table
- Given the top captain candidate exceeds the TC threshold, when recommendations are shown, then a "Triple Captain candidate" flag appears with the specific reasoning
- Given a squad with a player who's a fixture doubt (rotation risk indicated by low recent minutes), when the optimal XI is generated, then that player is flagged, not silently benched without explanation
- Given a user with no squad entered, when they choose "random squad," then a valid FPL squad (£100m budget, correct position split, max 3 players per club) is generated instantly and recommendations run against it the same as a manually entered squad

### Nice-to-Have (P1) — fast follow after v1 validates
- [ ] Transfer recommender: given budget + free transfers, suggests the highest-value swap (in vs. out), including whether a hit (-4) is worth taking
- [ ] Chip timing advisor: recommends optimal gameweek windows for Wildcard/Bench Boost/Free Hit based on fixture swings (blank/double gameweeks) and squad state
- [ ] Differential finder: low-ownership (<10%) players the model rates above their ownership would suggest, for users chasing rank rather than protecting it
- [ ] Save/reload squad (requires lightweight auth or a shareable squad code — decide based on P0 usage before building)

### Future Considerations (P2) — design for, don't build yet
- [ ] Rank-aware recommendations (a differential-hunting recommendation differs for someone in the top 10k vs. someone mid-table — don't hardcode a single "optimal" that ignores the user's context)
- [ ] Post-gameweek accuracy tracking (did the recommended captain outperform the field? Build this as a trust/credibility layer once the core engine is proven)
- [ ] Notification/reminder before deadline (push or email) — only worth it once there's a reason to bring users back beyond their own habit

## Modules

The product is not one dashboard with tabs — it's a set of purpose-built modules, each answering one question. A user should be able to land on a module and get an answer, not a data view. Home exists to route them to the right question fast, not to summarize everything at once.

### 1. Home
**Priority:** P0
**Answers:** "What do I need to do before the deadline?"
One clear entry point, not a landing page full of widgets. Shows deadline countdown, and a single primary action: enter squad or generate a random one if no squad is saved yet. Once a squad exists, Home becomes the summary of *this week's* calls (captain, any flagged transfer/chip opportunity) — not a hub of links to go explore.

### 2. Squad Setup
**Priority:** P0
**Answers:** "What's my 15?"
Manual entry via searchable player picker, or one-tap random squad generation (budget-compliant, position-compliant, max 3 per club — same validation either way). This is the only module that's about data entry rather than a recommendation; every other module depends on its output.

### 3. Captain Call
**Priority:** P0
**Answers:** "Who do I captain this week?"
The core module — the reason the product exists. One recommended captain, one-sentence reasoning (xG/xA + fixture + form), and a Triple Captain flag when the top pick clears the confidence threshold. No ranked table as the primary view — the reasoning text is the product, supporting stats are secondary and collapsed by default.

### 4. Optimal XI
**Priority:** P0
**Answers:** "Who do I start, and in what formation?"
Takes the Squad Setup output, applies the same underlying model used for Captain Call, and returns a starting XI + bench order. Flags any player with rotation risk instead of silently benching them, per the PRD acceptance criteria.

### 5. Defensive Watch
**Priority:** P0
**Answers:** "Which of my defenders/keeper are worth starting for clean sheet points?"
Clean sheet probability per defender/GK in the squad, feeding directly into Optimal XI and Captain Call rather than existing as a standalone stats page.

### 6. Transfer Advisor
**Priority:** P1
**Answers:** "Should I make a transfer this week, and is it worth a hit?"
Given budget and free transfers, recommends the highest-value swap and states plainly whether a -4 hit is worth taking, not just "here are some players in form."

### 7. Chip Strategy
**Priority:** P1
**Answers:** "Should I play a chip this week, or hold?"
Recommends optimal Wildcard/Bench Boost/Free Hit windows based on fixture swings (blanks/doubles) and current squad state. A yes/no/hold call, not a chip explainer.

### 8. Differential Radar
**Priority:** P1
**Answers:** "What's a low-ownership pick worth taking a risk on?"
Surfaces players under 10% ownership the model rates above what their ownership would suggest — for users chasing rank rather than protecting it.

### 9. Squad Vault
**Priority:** P1
**Answers:** "Can I come back without re-entering my squad?"
Save/reload a squad via a shareable code or lightweight auth — decide the mechanism based on how much P0 usage actually needs it before building.

### 10. Data Sync Layer
**Priority:** P0 (internal, not user-facing)
**Answers:** nothing directly — this is the module every other module depends on.
Owns the only connection to the official FPL API, caches `bootstrap-static` hourly, and serves every other module from that cache rather than each module hitting FPL independently. This is where the rate-limit mitigation from the earlier open question lives architecturally, not bolted on per-module.

## Success Metrics

**Leading indicators**
- Recommendation-to-decision rate: % of users whose actual captain pick matches the top recommendation (target: 60%+ by GW10 — signals trust in the engine)
- Time-to-recommendation: user opens app to seeing captain call, target under 2 minutes including squad entry
- Weekly return rate during active season (target: 40%+ week-over-week during GW1-10)

**Lagging indicators**
- Recommended captain's average points vs. the FPL-wide average captain points per gameweek (this is the core value claim — track it publicly, it's also your best marketing asset if it's positive)
- Season-long retention: % of users still active at GW20 vs. GW1

## Open Questions

- What's the minutes/rotation-risk data source for the "flagged, not silently benched" acceptance criterion — bootstrap-static alone doesn't give reliable rotation signal. (data)
- Do we need any auth for v1, or is a shareable squad code (no login) enough to validate the recommendation engine before building accounts? (product)
- Threshold definition for "Triple Captain candidate" — needs an actual number (e.g. top pick's projected points exceeds 2nd place by X%) rather than a vibe. (product/data)
- Is there a real cost/rate-limit risk in hitting the official FPL API at scale once this has real users? Worth checking before assuming it scales for free indefinitely. (engineering)

## Timeline Considerations

- **Hard deadline**: Premier League 2026/27 season is starting now — GW1 is the only week you get zero competition for user attention before habits form around other tools. The earliest usable slice should ship before GW1 lifts, even if thin, rather than late and complete.
- **Phasing, mapped to modules:**
  - **V1** — Squad Setup + Captain Call only (Modules 2-3). The narrowest possible proof that the recommendation engine works and is worth trusting, no Home page yet, entry straight into squad input.
  - **V2** — Modules 1-4: add Home and Optimal XI to the V1 base. This is the first version that's a coherent product rather than a single feature — a real entry point, plus the captain call extended into a full starting XI decision, not just one player.
  - **V3** — Module 5 (Defensive Watch) plus the P1 modules (Transfer Advisor, Chip Strategy, Differential Radar, Squad Vault), once V2 usage validates the "recommendation beats gut feel" claim with real gameweek results.
- No hard dependency on external teams — single-developer build against a public API
