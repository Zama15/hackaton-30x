#!/usr/bin/env bash
# Runs /night-shift repeatedly (one backlog task per run) until a stop time,
# the backlog is empty, or too many runs fail in a row.
#
# Usage (from the repo root, ideally inside tmux/screen so it survives logout):
#   ops/night-shift.sh                       # until 07:00, max 15 tasks
#   STOP_AT=06:30 MAX_TASKS=8 ops/night-shift.sh
#   DRY_RUN=1 ops/night-shift.sh             # print what would run
#
# On the host it launches each run through scripts/claude.sh (the Podman sandbox).
# Inside the container (no podman) it calls `claude` directly.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STOP_AT="${STOP_AT:-07:00}"
MAX_TASKS="${MAX_TASKS:-15}"
TASK_TIMEOUT="${TASK_TIMEOUT:-5400}"   # seconds per task (90 min)
MAX_FAILS="${MAX_FAILS:-3}"            # consecutive failed runs before giving up
RETRY_SLEEP="${RETRY_SLEEP:-900}"      # wait after a failed run (e.g. usage limit), seconds
DRY_RUN="${DRY_RUN:-}"

stop_epoch=$(date -d "$STOP_AT" +%s)
[ "$stop_epoch" -le "$(date +%s)" ] && stop_epoch=$((stop_epoch + 86400))

if command -v podman >/dev/null 2>&1 && [ -x "$ROOT/scripts/claude.sh" ]; then
  CLAUDE=("$ROOT/scripts/claude.sh")
else
  CLAUDE=(claude --dangerously-skip-permissions)
fi

LOG_DIR="$ROOT/logs/night-$(date +%F)"
mkdir -p "$LOG_DIR"
SUMMARY="$LOG_DIR/summary.txt"
log() { echo "[$(date '+%F %T')] $*" | tee -a "$SUMMARY"; }

log "night shift starting; stop at $(date -d "@$stop_epoch" '+%F %T'), max $MAX_TASKS tasks, runner: ${CLAUDE[*]}"
fails=0
for i in $(seq 1 "$MAX_TASKS"); do
  remaining=$((stop_epoch - $(date +%s)))
  if [ "$remaining" -le 600 ]; then log "stop time reached"; break; fi
  timeout_s=$(( remaining < TASK_TIMEOUT ? remaining : TASK_TIMEOUT ))

  run_log="$LOG_DIR/run-$(printf %02d "$i")-$(date +%H%M).log"
  log "run $i: starting (timeout ${timeout_s}s) -> $run_log"
  if [ -n "$DRY_RUN" ]; then
    echo "timeout $timeout_s ${CLAUDE[*]} -p /night-shift --output-format text"; break
  fi

  timeout "$timeout_s" "${CLAUDE[@]}" -p "/night-shift" --output-format text >"$run_log" 2>&1
  code=$?
  status=$(grep -ao 'NIGHT_SHIFT: [A-Z_]*.*' "$run_log" | tail -1 | tr -d '\r')
  log "run $i: exit $code, ${status:-no status line}"

  case "$status" in
    "NIGHT_SHIFT: BACKLOG_EMPTY"*|"NIGHT_SHIFT: ALL_BLOCKED"*) log "nothing left to do"; break ;;
    "NIGHT_SHIFT: DONE"*|"NIGHT_SHIFT: BLOCKED"*) fails=0 ;;
    *)
      fails=$((fails + 1))
      if [ "$fails" -ge "$MAX_FAILS" ]; then log "$fails failed runs in a row, stopping"; break; fi
      log "failed run, sleeping ${RETRY_SLEEP}s before retrying"
      sleep "$RETRY_SLEEP"
      ;;
  esac
done
log "night shift finished. See docs/PROGRESS.md and open PRs: gh pr list --base dev --state all"
