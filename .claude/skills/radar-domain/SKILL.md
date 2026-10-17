---
name: radar-domain
description: Domain knowledge for Radar 30X — the audience, trend-stage definitions, "why it worked" dimensions, compliance rules, and code conventions. Load before writing or reviewing any Radar 30X code or prompts.
---

# Radar 30X domain guide

## What we're building
A content radar for 30X's media team: which **AI topics and formats** are taking off on LinkedIn, Instagram, TikTok and YouTube, **why** they work, whether they're **early or already saturated**, and whether they **fit** 30X's audience. Full spec: `docs/SPEC.md`. Audience: `config/audience.md`.

## The three questions and how we answer them
1. **Early trend detection.** Look at momentum over snapshot history, not raw volume. A topic is `emerging` when its volume is still low but velocity and acceleration are high, especially when several independent sources agree (YouTube + web + Wikipedia pageviews), or when small creators beat their own baseline. It's `saturated` when volume is high, velocity is flat, and there's high near-duplicate density (everyone posting the same angle).
2. **Why it worked.** Fixed dimensions:
   - **Hook:** first line or first 3 seconds. Classify as question, bold claim, number/list, story, contrarian, or demo.
   - **Format:** short video, long video, carousel, text post, thread, live, newsletter.
   - **Topic angle:** e.g. "how-to", "news reaction", "case study", "framework", "opinion".
   - **Timing:** news-driven vs evergreen, day of week, and how soon after a trigger event it was posted.
   - **Creator:** brand, executive, educator, media, or independent creator, plus their audience size relative to engagement.
3. **Audience fit.** Score 0–100 against `config/audience.md`. Always give reasons and risks. Penalize content that is US-only, purely technical, or hype/fear without substance.

## Compliance (blocking in review)
- Public content only. No logins, cookies, headless browsing of login-walled pages, CAPTCHA bypass, or ignoring robots.txt or rate limits.
- LinkedIn, Instagram and TikTok are reached **only** through publicly indexed results (the Claude web search / web fetch server tools on public URLs) or community-submitted public links. Never scrape them directly.
- No personal data. Store public creator handles only (accounts publishing publicly). Never store commenters, emails, phones, or private profiles. Excerpts are ≤ 280 chars, plus the URL.
- Every source has an approved row in `docs/SOURCES.md`.

## Code conventions
- TypeScript ESM, Node ≥ 20, strict mode. Layout: `src/radar` (types), `src/collectors`, `src/store`, `src/analysis` (+ `prompts/*.md`), `src/report`, `src/cli`.
- Claude API: `@anthropic-ai/sdk`, models from `src/config.ts` (`RADAR_MODEL`, `RADAR_BULK_MODEL`, default `claude-opus-5-5`), adaptive thinking, structured outputs for anything parsed. Always check `stop_reason` (`refusal`, `pause_turn`, `max_tokens`). Load the `claude-api` skill before writing API code.
- Dependency injection for `fetch`, the Anthropic client, clock and data dir. Tests use `node:test` + fixtures and run offline.
- Prompts live in `.md` files next to the code, written in English, and ask for Spanish output where it's user-facing.
