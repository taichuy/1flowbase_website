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
ACTION_URL="${ACTION_URL:-https://github.com/taichuy/1flowbase_website/actions/workflows/deploy.yml}"
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

for command_name in git pnpm; do
  command -v "$command_name" >/dev/null 2>&1 || fail "required command not found: $command_name"
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  fail "working tree is not clean; commit or stash changes before releasing"
fi

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

if [[ "$MODE" == "check" ]]; then
  printf '\nRelease check complete; no merge or push was performed.\n'
  exit 0
fi

CURRENT_STEP="pushing target branch"
log "Push $TARGET_BRANCH to $REMOTE"
git push "$REMOTE" "$TARGET_BRANCH"

CURRENT_STEP="complete"
printf '\nPush complete; GitHub Actions will deploy this commit to Cloudflare.\n'
printf '  source: %s/%s\n' "$REMOTE" "$SOURCE_BRANCH"
printf '  target: %s/%s @ %s\n' "$REMOTE" "$TARGET_BRANCH" "$(git rev-parse --short HEAD)"
printf '  action: %s\n' "$ACTION_URL"
