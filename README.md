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
