---
name: night-shift
description: Autonomous builder loop for Radar 30X. Picks the next backlog task, delegates to the source-researcher, implementer and reviewer subagents, verifies, and ships it to dev via PR. Run with /night-shift (one task per run; ops/night-shift.sh loops it overnight).
---

# Night shift: ship one backlog task

You are the orchestrator. Nobody is watching, so never stop to ask questions: make a sensible call, write it down in `docs/PROGRESS.md`, and keep going. Do exactly **one** task per run, then finish with the status line described at the end.

## 0. Preflight
1. `git status --porcelain` and `git branch --show-current`.
2. If the tree is dirty or you're on a `feat/T*` branch, a previous run was interrupted. Resume that task: its branch name gives the id. Skip to step 3 with the existing work.
3. Otherwise `git checkout dev && git pull --ff-only gh dev`. If the `gh` remote is missing, add it: `git remote add gh https://github.com/Zama15/hackaton-30x.git`.
4. `npm install` if `package.json` changed since the last install; then `npm run typecheck && npm test`. If `dev` itself is broken, the task for this run is to fix it: use a `fix/dev-green` branch and skip to step 3.

## 1. Pick the task
1. Read `docs/BACKLOG.md`. Choose the first `[ ]` task whose deps are all `[x]`.
2. If none is left, print `NIGHT_SHIFT: BACKLOG_EMPTY` and stop. If tasks remain but all are blocked or waiting on blocked deps, print `NIGHT_SHIFT: ALL_BLOCKED` and stop.
3. `git checkout -b feat/<id>-<short-slug>` from `dev` (e.g. `feat/T04-youtube-collector`).
4. Mark the task `[~]` in BACKLOG.md.

## 2. Build
1. **New data source?** (any collector or external API) → run the `source-researcher` subagent with the source name and what we need from it. If it says not allowed, mark the task `[!]`, give the reason, rewrite the task to use the suggested compliant alternative if there is one, and commit that (go to step 4, outcome = blocked). If allowed, paste its row into `docs/SOURCES.md`.
2. Run the `implementer` subagent. Give it the full task text, acceptance criteria, and any researcher notes.
3. Run `npm run typecheck && npm test` yourself. Don't trust a green claim without seeing the output.
4. Run the `reviewer` subagent. Give it the task text and acceptance criteria.
5. If the verdict is `CHANGES_REQUESTED` (or checks fail), send the blocking issues back to the `implementer` and review again. Allow at most **3 review rounds** in total. After the 3rd failing round, the task is blocked.

## 3. Ship
Follow the `ship-to-dev` skill:
- Merged outcome: mark `[x]` in BACKLOG.md, append to PROGRESS.md, commit, push, open a PR to `dev`, merge it, and sync local `dev`.
- Blocked outcome: mark `[!]` plus the reason, append to PROGRESS.md, commit, push the branch, and open a **draft** PR to `dev` (don't merge). Then go back to `dev` and put the BACKLOG/PROGRESS update on `dev` through a small `chore/<id>-blocked` PR that you merge, so the next run skips this task.

## 4. Finish
Your last line must be exactly one of:
- `NIGHT_SHIFT: DONE <id> <pr-url>`
- `NIGHT_SHIFT: BLOCKED <id> <pr-url>`
- `NIGHT_SHIFT: BACKLOG_EMPTY`
- `NIGHT_SHIFT: ALL_BLOCKED`
- `NIGHT_SHIFT: ERROR <one-line reason>` (only if you can't even get `dev` checked out and green)

## Guardrails
- Never push to, merge into, or open PRs against `main`. A hook enforces this too.
- Never force-push. Never rewrite `dev` history.
- Don't edit `.env`, `scripts/`, or `.claude/settings.json`.
- Don't change the spec or reorder the backlog on your own. If you think the spec is wrong, add a note to PROGRESS.md under "Questions for humans".
- Tests and the demo run offline. Never run commands that call the real Claude API or spend API credits (`npm run radar` without `--offline`, live collectors).
