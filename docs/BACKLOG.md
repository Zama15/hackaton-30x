# Backlog

The builder team works top to bottom. Each run of `/night-shift` takes the **first** task marked `[ ]` whose dependencies are all `[x]`.

Status markers: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked (the reason goes on the line below the task).

Humans can add, reorder or edit tasks at any time. Keep each task small enough for one session, with acceptance criteria that can be checked.

---

- [ ] **T01 — Core types and snapshot store**
  - `src/radar/types.ts`: `Signal` (id = url hash, source, platform, url, title, excerpt ≤280, creator {handle, type, followers?}, publishedAt, collectedAt, metrics {views?, likes?, comments?, shares?}, lang, topics?).
  - `src/store/snapshots.ts`: append to `data/snapshots/<YYYY-MM-DD>.jsonl`, load by date range, dedupe by id (latest metrics win).
  - Add `data/` to .gitignore.
  - Accept: unit tests for append, dedupe and range loading using a temp dir.

- [ ] **T02 — Collector interface + Hacker News collector** (deps: T01)
  - `src/collectors/types.ts`: `Collector { name; platform; collect(opts: {since: Date; query: string[]}, deps: {fetch; env}) : Promise<Signal[]> }`.
  - `src/collectors/hackernews.ts` using the public Algolia HN Search API.
  - `src/collectors/index.ts` registry.
  - Accept: test with a recorded JSON fixture and injected fetch; a SOURCES.md row.

- [ ] **T03 — `collect` CLI** (deps: T02)
  - `src/cli/collect.ts` plus an npm script `collect`. Flags `--sources`, `--days`. Default AI queries live in `config/queries.json` (ES + EN, e.g. "inteligencia artificial", "IA generativa", "agentes de IA", "AI agents", "ChatGPT empresa").
  - Accept: running it with HN only writes a snapshot; prints a count per source.

- [ ] **T04 — YouTube collector** (deps: T02)
  - YouTube Data API v3: `search.list` (recent, `relevanceLanguage=es`, regions MX/CO/AR/CL/PE/ES), then `videos.list` for stats and `channels.list` for subscriber baseline. Skip with a warning when `YOUTUBE_API_KEY` is unset.
  - Accept: fixture-based test; quota usage documented in SOURCES.md.

- [ ] **T05 — Web-discovery collector for LinkedIn / Instagram / TikTok** (deps: T02)
  - Use the Claude API `web_search_20260209` server tool to find publicly indexed posts (e.g. `site:linkedin.com/posts` + AI queries in Spanish). Return structured `Signal`s via `output_config.format`. Handle `pause_turn` and `refusal`.
  - Only fields visible in the search result or public page. No login and no direct scraping of the platforms.
  - Accept: test with a mocked Anthropic client; per-platform toggle; SOURCES.md rows.

- [ ] **T06 — Community links collector** (deps: T02)
  - Read public URLs from `config/community-links.txt` (one per line, `#` comments). Enrich each via Claude `web_fetch_20260209` (title, excerpt, platform, creator handle, format).
  - Accept: mocked-client test; invalid or private URLs are skipped with a reason.

- [ ] **T07 — Topic classification** (deps: T01)
  - `config/topics.json` seed taxonomy (~30 AI topics relevant to business leaders: agents, AI in sales, productivity copilots, AI regulation LatAm, prompt skills for managers, AI and jobs, etc.).
  - `src/analysis/topics.ts`: batch ≤50 signals per request, structured output, cache by signal id in `data/cache/topics.json`, uses `RADAR_BULK_MODEL`.
  - Accept: mocked-client tests covering batching, caching, and new-topic handling.

- [ ] **T08 — Momentum and trend stage scoring** (deps: T07)
  - `src/analysis/momentum.ts`: pure functions for velocity, acceleration, baseline-normalized engagement, near-duplicate density, and stage classification (`emerging|growing|saturated|declining`) with thresholds in `config/momentum.json`.
  - Accept: thorough unit tests with synthetic time series, including an "emerging" case and a "saturated" case.

- [ ] **T09 — "Why it worked" analyzer** (deps: T07)
  - `src/analysis/explain.ts`: for the top N pieces per topic, extract hook, format, angle, timing, creator type, and a 1-sentence "por qué funcionó" in Spanish. Structured output.
  - Accept: mocked-client test validating the schema; prompt in `src/analysis/prompts/explain.md`.

- [ ] **T10 — Audience fit scorer** (deps: T07)
  - `src/analysis/audience.ts`: score 0–100 per topic against `config/audience.md`, with reasons and risks, in Spanish.
  - Accept: mocked-client test; the rubric is documented in the prompt file.

- [ ] **T11 — Report generator** (deps: T08, T09, T10)
  - `src/report/`: rank by momentum × fit; top-10 Markdown + JSON in Spanish (topic, stage, evidence links, por qué funciona, 2–3 ideas de adaptación con formato y gancho de ejemplo).
  - Accept: snapshot test of Markdown output from fixture data.

- [ ] **T12 — `radar` CLI end to end** (deps: T03, T11)
  - `src/cli/radar.ts` plus an npm script `radar`: `--platform`, `--days`, `--top`, `--offline`. Writes `reports/<date>-<platform>.{md,json}`.
  - Accept: an integration test with fixtures and a mocked client produces a 10-item report.

- [ ] **T13 — Offline demo** (deps: T12)
  - `npm run demo`: realistic fixtures in `tests/fixtures/demo/` (synthetic, no real personal data), runs the whole pipeline offline with a mocked client that returns canned structured outputs.
  - Accept: `npm run demo` exits 0 and writes a report; this is documented in README.

- [ ] **T14 — HTML report** (deps: T12)
  - Generate a self-contained `reports/<date>-<platform>.html` (no external assets) from the JSON: ranked cards, stage badges, evidence links, adaptation ideas.
  - Accept: test that the HTML contains all 10 topics; the file opens offline.

- [ ] **T15 — Wikipedia pageviews momentum signal** (deps: T08)
  - Optional boost: map topics to es/en Wikipedia articles and use the public Pageviews REST API as an independent attention signal in momentum.
  - Accept: fixture test; SOURCES.md row.

- [ ] **T16 — Cost controls and run summary** (deps: T12)
  - Track `usage` tokens per stage and print an estimated cost at the end of each `radar` run. Add a `--max-signals` cap. Use the Message Batches API path for classification when `--batch` is set.
  - Accept: unit test of the cost calculator; README section on cost.

- [ ] **T17 — Pitch README** (deps: T13)
  - README: problem, approach, how it answers the 3 questions, compliance stance, how to run, sample output, and next steps.
