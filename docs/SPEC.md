# Radar 30X — product spec

The source of truth for what the builder team is making. Original brief: [CHALLENGE.md](CHALLENGE.md). Work items: [BACKLOG.md](BACKLOG.md).

## Goal

A CLI (plus a static HTML report) that answers:

> "¿Cuáles son los 10 temas de IA que más están creciendo esta semana en {plataforma}, por qué funcionan y cómo los adaptamos para 30X?"

…cheaply, from **public** content only, and explains each answer.

## Pipeline

```
collect ──► store snapshots ──► classify topics ──► score momentum ──► explain "why" ──► audience fit ──► report
(collectors)  (data/*.jsonl)     (Claude, batch)     (pure TS)          (Claude)          (Claude+rubric)  (md/json/html)
```

1. **Collectors** (`src/collectors/`) pull public posts/videos about AI into a common `Signal` shape. Each one implements the `Collector` interface and is registered in `src/collectors/index.ts`. Every collector needs a row in [SOURCES.md](SOURCES.md) proving it is allowed.
2. **Store** (`src/store/`) appends signals to dated JSONL snapshots in `data/` (gitignored) and dedupes by URL. History across runs is what makes early-trend detection possible, so `npm run collect` is designed to run daily from cron.
3. **Topic classification** (`src/analysis/topics.ts`) maps each signal to 1–3 normalized AI topics from a seed taxonomy (`config/topics.json`), with new topics allowed. It uses Claude with structured outputs and batches many signals per request.
4. **Momentum** (`src/analysis/momentum.ts`) is pure, deterministic and unit-tested:
   - `velocity`: growth in mentions and engagement between the current window and the previous one.
   - `acceleration`: change in velocity.
   - Engagement is normalized by creator baseline (followers/subscribers) when that is known, so a small creator outperforming their baseline counts as a strong signal.
   - Each topic gets a **stage**: `emerging` (low volume, high acceleration), `growing`, `saturated` (high volume, flat or declining velocity, many near-duplicate pieces), or `declining`.
5. **Why it worked** (`src/analysis/explain.ts`): for the top pieces per topic, Claude extracts the hook (first line or first 3 seconds), format (carousel, short video, long video, text post, thread…), topic angle, timing, and creator type (brand, executive, educator, media). Output is structured.
6. **Audience fit** (`src/analysis/audience.ts`): scores 0–100 against [config/audience.md](../config/audience.md) (LatAm executives and teams learning AI, Spanish-first), with reasons and risks.
7. **Report** (`src/report/`): ranks topics by `momentum × audience fit`. For each of the top 10 it shows the topic, stage, evidence links, why it works, and 2–3 concrete adaptation ideas for 30X (format + hook example in Spanish). It writes `reports/<date>-<platform>.md`, `.json` and `.html`.

## CLI

- `npm run collect -- [--sources hn,youtube,web]` saves a snapshot.
- `npm run radar -- --platform linkedin --days 7 [--top 10]` runs the full pipeline and writes the report.
- `npm run demo` runs the full pipeline **offline** on `tests/fixtures/` with a mocked Claude client. It must always work; this is the hackathon demo path.

## Platform coverage strategy (public and ToS-safe)

| Platform | Approach |
|---|---|
| YouTube | Official YouTube Data API v3 (free quota, `YOUTUBE_API_KEY`) |
| LinkedIn, Instagram, TikTok | No scraping and no logins. Discover publicly indexed posts through the Claude API web search server tool (`web_search_20260209`), and extract only what the public page or search result shows |
| Open signals | Hacker News (Algolia API), Wikipedia pageviews API (topic momentum), news RSS, and others only once verified in SOURCES.md |
| Community as sensor | `config/community-links.txt`: the team pastes public URLs they've seen during the week, and these get analyzed like any other signal |

## Hard rules

- Public content only. No logins, no bypassing rate limits or robots.txt, nothing that violates a platform's ToS.
- No personal data. Store creator handles only for public accounts acting publicly (brands, creators, executives posting publicly). Never store private individuals' data, emails, phone numbers, or commenter identities. Store only short text excerpts (≤ 280 chars) plus the URL.
- Tests never hit the network or the Claude API. Inject `fetch` and the Anthropic client, and use fixtures.
- Cost: classification batches many signals per call and caches results by URL hash in `data/cache/`. Models are configurable (`RADAR_MODEL`, `RADAR_BULK_MODEL`), and both default to `claude-opus-5-5`. The team may set `RADAR_BULK_MODEL=claude-haiku-5-5` for cheaper bulk classification.
- All user-facing report text is in Spanish (LatAm neutral). Code, comments and docs are in English.
