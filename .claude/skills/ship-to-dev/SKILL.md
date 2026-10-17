---
name: ship-to-dev
description: Commit, push, open a PR to dev, and merge it, following this repo's git rules (dev is the integration branch; main is prod and owner-only). Use whenever finishing a change in this repo.
---

# Ship a branch to dev

1. **Check:** `npm run typecheck && npm test` must pass (unless shipping a blocked task as a draft).
2. **Commit:** `git add -A`, then `git status` to make sure no `.env`, `data/`, `reports/` or `node_modules/` files are staged. Commit message: `<id>: <summary>` plus a short body, ending with:
   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   ```
3. **Push:** `git push -u gh <branch>`. The `gh` remote is `https://github.com/Zama15/hackaton-30x.git`; add it if it's missing. Use HTTPS because the `origin` SSH alias doesn't resolve in the container.
4. **PR:** run `gh pr create --base dev --head <branch> --title "<id>: <summary>" --body ...`, with a body containing:
   - `## Summary`: 2–4 bullets
   - `## Acceptance criteria`: a checklist, each item ticked or explained
   - `## Test plan`: the commands run and their results
   - `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
   - Add `--draft` for blocked tasks.
5. **Merge** (not for drafts): `gh pr merge <n> --merge`, as its own Bash command. Don't chain it after PR creation: the guard hook looks up the PR's base before the command runs, so it blocks a PR that doesn't exist yet. Then `git checkout dev && git pull --ff-only gh dev`.
6. If the merge conflicts: `git checkout <branch> && git merge gh/dev`, resolve the conflicts, rerun the checks, push (no force), and retry the merge.

**Never** use `--base main`, push to `main`, or merge PRs whose base is `main`.
