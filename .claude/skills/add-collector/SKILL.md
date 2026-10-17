---
name: add-collector
description: Recipe for adding a new Radar 30X data collector (public, ToS-safe source → Signal[]), including the compliance gate, interface, fixtures and tests. Use when a task adds or changes a collector.
---

# Add a collector

1. **Gate:** there must be an approved row (`Allowed? = yes`) in `docs/SOURCES.md`. If there isn't, stop. The orchestrator runs `source-researcher` first.
2. **File:** create `src/collectors/<name>.ts`, exporting a `Collector` (`src/collectors/types.ts`):
   ```ts
   export const youtube: Collector = {
     name: "youtube",
     platform: "youtube",
     async collect({ since, query }, { fetch, env }) { /* … */ return signals; },
   };
   ```
   - Read keys from the injected `env`. If a key is missing, log a warning and return `[]`; never throw.
   - Respect the documented rate limits: sequential requests plus a small delay, and stop at a page cap.
   - Map to `Signal`: id = sha256(url), excerpt trimmed to ≤ 280 chars, `creator` = public handle + type only, metrics when available, `lang` detected or taken from the API.
   - Drop anything that isn't public or has no URL.
3. **Register** it in `src/collectors/index.ts`.
4. **Fixtures:** record or craft realistic responses into `tests/fixtures/<name>/*.json`. Strip any personal data. Use synthetic handles for non-public people.
5. **Tests:** `tests/collectors/<name>.test.ts` with an injected fake `fetch` that serves the fixtures. Cover the happy path, a missing key, an empty result, and HTTP errors.
6. **Docs:** update the SOURCES.md row with the endpoints and quota actually used.
