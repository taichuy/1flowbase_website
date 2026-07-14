#!/usr/bin/env bash

set -Eeuo pipefail

MODE="release"
if [[ "${1:-}" == "--check" ]]; then
  MODE="check"
  shift
fi

REMOTE="${REMOTE:-origin}"
TARGET_BRANCH="${TARGET_BRANCH:-main}"
SOURCE_BRANCH="${1:-${SOURCE_BRANCH:-taichuy/dev}}"
WORKER_NAME="${WORKER_NAME:-1flowbase-website}"
PRODUCTION_URL="${PRODUCTION_URL:-https://1flowbase-website.taichuy2021.workers.dev}"
CREDENTIALS_FILE="${CLOUDFLARE_CREDENTIALS_FILE:-$HOME/.config/cloudflare/wrangler.env}"
CURRENT_STEP="startup"

log() {
  printf '\n==> %s\n' "$*"
}

fail() {
  printf '\nERROR: %s\n' "$*" >&2
  exit 1
}

on_error() {
  local exit_code=$?
  printf '\nERROR: release failed during: %s\n' "$CURRENT_STEP" >&2
  exit "$exit_code"
}

trap on_error ERR

for command_name in git pnpm wrangler curl; do
  command -v "$command_name" >/dev/null 2>&1 || fail "required command not found: $command_name"
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  fail "working tree is not clean; commit or stash changes before releasing"
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" && -f "$CREDENTIALS_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$CREDENTIALS_FILE"
  set +a
fi

[[ -n "${CLOUDFLARE_API_TOKEN:-}" ]] || fail "CLOUDFLARE_API_TOKEN is missing; expected it in the environment or $CREDENTIALS_FILE"

CURRENT_STEP="fetching remote branches"
log "Fetch $REMOTE"
git fetch "$REMOTE" --prune

git show-ref --verify --quiet "refs/remotes/$REMOTE/$TARGET_BRANCH" \
  || fail "remote target branch does not exist: $REMOTE/$TARGET_BRANCH"
git show-ref --verify --quiet "refs/remotes/$REMOTE/$SOURCE_BRANCH" \
  || fail "remote source branch does not exist: $REMOTE/$SOURCE_BRANCH"

CURRENT_STEP="updating local target branch"
log "Update local $TARGET_BRANCH"
git switch "$TARGET_BRANCH"
git pull --ff-only "$REMOTE" "$TARGET_BRANCH"

CURRENT_STEP="merging source branch"
if git merge-base --is-ancestor "$REMOTE/$SOURCE_BRANCH" "$TARGET_BRANCH"; then
  log "$REMOTE/$SOURCE_BRANCH is already included in $TARGET_BRANCH"
elif [[ "$MODE" == "check" ]]; then
  log "Check mode: $REMOTE/$SOURCE_BRANCH would be merged into $TARGET_BRANCH"
else
  log "Merge $REMOTE/$SOURCE_BRANCH into $TARGET_BRANCH"
  git merge --no-ff "$REMOTE/$SOURCE_BRANCH" -m "merge: integrate $SOURCE_BRANCH into $TARGET_BRANCH"
fi

CURRENT_STEP="building production site"
log "Build production site"
pnpm build

CURRENT_STEP="checking Cloudflare upload"
log "Validate Cloudflare upload"
wrangler deploy --dry-run

if [[ "$MODE" == "check" ]]; then
  printf '\nRelease check complete; no merge, push, or deployment was performed.\n'
  exit 0
fi

CURRENT_STEP="pushing target branch"
log "Push $TARGET_BRANCH to $REMOTE"
git push "$REMOTE" "$TARGET_BRANCH"

CURRENT_STEP="deploying Cloudflare Worker"
log "Deploy $WORKER_NAME to Cloudflare"
wrangler deploy

CURRENT_STEP="checking production pages"
log "Check production pages"
for path in / /zh/; do
  status="$(curl -sS --retry 4 --retry-all-errors --retry-delay 2 --connect-timeout 10 --max-time 30 -o /dev/null -w '%{http_code}' "${PRODUCTION_URL}${path}")" \
    || fail "health check request failed: ${PRODUCTION_URL}${path}"
  [[ "$status" == "200" ]] || fail "health check failed: ${PRODUCTION_URL}${path} returned HTTP $status"
  printf '  HTTP %s  %s%s\n' "$status" "$PRODUCTION_URL" "$path"
done

CURRENT_STEP="complete"
printf '\nRelease complete\n'
printf '  source: %s/%s\n' "$REMOTE" "$SOURCE_BRANCH"
printf '  target: %s/%s @ %s\n' "$REMOTE" "$TARGET_BRANCH" "$(git rev-parse --short HEAD)"
printf '  site:   %s\n' "$PRODUCTION_URL"
