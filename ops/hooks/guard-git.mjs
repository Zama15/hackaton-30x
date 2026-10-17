#!/usr/bin/env node
// PreToolUse hook for Bash: blocks git/gh commands that would touch `main`
// or force-push. `main` is prod and only the repo owner merges into it.
// Exit code 2 blocks the tool call and shows stderr to Claude.
import { execFileSync } from "node:child_process";

const input = JSON.parse(await new Promise((resolve) => {
  let data = "";
  process.stdin.on("data", (c) => (data += c));
  process.stdin.on("end", () => resolve(data || "{}"));
}));
const command = String(input?.tool_input?.command ?? "");

function block(reason) {
  process.stderr.write(`Blocked by guard-git: ${reason}\nRule: dev is the integration branch; only the repo owner merges dev -> main. Never force-push.\n`);
  process.exit(2);
}

function sh(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

// Check each chained sub-command separately. Only segments that *start* with
// git/gh count (after optional `VAR=x` prefixes), so text inside arguments
// such as commit messages or sed expressions doesn't trigger false positives.
const lead = String.raw`^(?:\w+=\S*\s+)*`;
const gitSub = (sub) => new RegExp(lead + String.raw`git\s+(?:-[Cc]\s+\S+\s+)*(?:` + sub + String.raw`)\b`);
const isGh = (sub) => new RegExp(lead + String.raw`gh\s+pr\s+` + sub + String.raw`\b`);

for (const part of command.split(/&&|\|\||[;|\n]/)) {
  const c = part.trim();
  if (!c) continue;

  if (gitSub("push").test(c)) {
    if (/(\s|:)(refs\/heads\/)?main(\s|$)/.test(c)) block("pushing to main");
    if (/\s(--force|--force-with-lease|-f)(\s|=|$)|\s\+\S/.test(c)) block("force push");
  }

  if (isGh("create").test(c) && !/(--base|-B)[=\s]+dev\b/.test(c)) {
    block("gh pr create must target dev explicitly (--base dev)");
  }

  if (isGh("merge").test(c)) {
    const m = c.match(/\bgh\s+pr\s+merge\s+(\d+)/);
    const repo = c.match(/(?:-R|--repo)[=\s]+(\S+)/)?.[1];
    const args = ["pr", "view", ...(m ? [m[1]] : []), ...(repo ? ["-R", repo] : []), "--json", "baseRefName", "-q", ".baseRefName"];
    const base = sh("gh", args);
    if (base !== "dev") block(`gh pr merge on a PR whose base is "${base || "unknown"}" (only base dev is allowed)`);
  }

  if (gitSub("merge|commit|rebase|reset|cherry-pick").test(c)) {
    const branch = sh("git", ["branch", "--show-current"]);
    if (branch === "main") block(`git ${c.match(/\b(merge|commit|rebase|reset|cherry-pick)\b/)[1]} while on main`);
  }
}
process.exit(0);
