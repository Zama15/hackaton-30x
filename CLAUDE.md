# CLAUDE.md

## What this repo is
**Radar 30X**: a hackathon prototype that finds which AI topics and formats are taking off on social media, explains why they work, and scores their fit for 30X's audience (LatAm leaders learning AI). Brief: `docs/CHALLENGE.md`. Spec: `docs/SPEC.md`. Work queue: `docs/BACKLOG.md`.

## Git workflow
- `dev` is the integration branch. All feature work merges into `dev`, never directly into `main`.
- `main` is production. Only the repo owner merges `dev` → `main` when releasing to prod. Never open, merge, or push to `main` yourself.
- Branch from the latest `dev` for every change, named `<type>/<short-desc>` (backlog tasks: `feat/T04-youtube-collector`).
- Open PRs with `--base dev`. Run `npm run typecheck` and `npm test` before opening one.
- Never force-push to `dev` or `main`.
- `ops/hooks/guard-git.mjs` (a PreToolUse hook in `.claude/settings.json`) enforces these rules. Don't disable it.

## Pushing
- The `origin` remote uses the SSH alias `git-zama`, which doesn't resolve inside the container. Push through the HTTPS remote `gh` instead (`https://github.com/Zama15/hackaton-30x.git`; add it if missing). The `gh` CLI token handles auth.

## Builder team (autonomous overnight work)
- `/night-shift` skill: ships one backlog task end to end (research → implement → review → PR to `dev` → merge). `ops/night-shift.sh` loops it overnight.
- Subagents in `.claude/agents/`: `implementer` (writes code and tests), `reviewer` (read-only verdict), `source-researcher` (ToS/public-access gate for data sources).
- Skills in `.claude/skills/`: `night-shift`, `ship-to-dev`, `radar-domain` (load before any Radar code), `add-collector`.
- Progress goes in `docs/PROGRESS.md`; data-source approvals go in `docs/SOURCES.md`.

## Hard rules
- Public content only, no personal data, no logins or ToS-violating scraping (details in the `radar-domain` skill).
- Tests run offline: inject `fetch` and the Anthropic client, use fixtures. Never spend API credits during automated runs.
- Never commit `.env`, `data/`, `reports/`, or `logs/`. Add new config keys to `.env.example`.
- User-facing report text in Spanish; code, comments and docs in English.
