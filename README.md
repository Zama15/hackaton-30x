# hackaton-30x

Agent-oriented TypeScript skeleton built on the Claude API tool runner (`@anthropic-ai/sdk`).

## Layout

```
src/
  index.ts          CLI entrypoint: npm run dev -- "your task"
  config.ts         Model, effort, iteration limits (env-overridable)
  agent/agent.ts    runAgent(): tool loop via client.beta.messages.toolRunner
  agent/prompt.ts   System prompt
  tools/            One file per tool (betaZodTool); register in tools/index.ts
tests/              node:test unit tests for tools
```

## Setup

```bash
npm install
cp .env.example .env   # set ANTHROPIC_API_KEY, or use `ant auth login`
npm run dev -- "What time is it in Tokyo?"
```

## Scripts

- `npm run dev` – run the agent with tsx
- `npm run build` / `npm start` – compile to `dist/` and run
- `npm run typecheck` – type-check only
- `npm test` – run tool unit tests (no API calls)

## Adding a tool

Copy `src/tools/echo.ts`, change the name, schema and `run`, then add it to `src/tools/index.ts`.

## Builder team (overnight autonomous development)

Claude Code agents build Radar 30X from `docs/BACKLOG.md`, one task per run. The flow for each task: source research (ToS gate) → implementer → reviewer → PR to `dev` → merge. `main` is never touched; a git hook enforces that.

```bash
# on the host, inside tmux so it survives closing the terminal
tmux new -s night
ops/night-shift.sh                     # runs until 07:00 (STOP_AT=06:30 to change), max 15 tasks
# detach: Ctrl-b d    reattach: tmux attach -t night
```

In the morning, check:
- `docs/PROGRESS.md`: what got done, what's blocked, questions for humans
- `logs/night-<date>/summary.txt` and the per-run logs
- `gh pr list --base dev --state all`: merged and draft (blocked) PRs

To run one task interactively instead, start `scripts/claude.sh` and type `/night-shift`.
