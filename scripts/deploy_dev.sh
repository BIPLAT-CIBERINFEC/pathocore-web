#!/usr/bin/env bash
# Pull-based continuous deployment for the PathoCore development host.
#
# Run on the development VM (for example from the systemd timer in
# deployment/cd/). It never receives code from GitHub: it pulls the official
# branches, deploys only commits whose GitHub checks are green, and rolls back
# to the previous revisions when the upgrade or the health checks fail.
#
#   PathoCore Web  -> WEB_BRANCH (dev)       orchestrator, deployed with upgrade
#   PathoCore API  -> API_BRANCH (develop)   sibling checkout built by the web
#   MePRAM OMOP API -> left as it is         updated by hand with its owner
#
# Usage: scripts/deploy_dev.sh [--dry-run] [--force] [--help]
set -euo pipefail

usage() {
    cat <<'EOF'
Pull-based deployment of PathoCore Web and PathoCore API on the development host.

Options:
  --dry-run   Fetch and report what would be deployed; change nothing.
  --force     Redeploy even when the checkouts already match the targets.
  --help      Show this help.

Configuration (environment, or the file in DEPLOY_ENV_FILE):
  DEPLOY_ROOT          Directory with the sibling checkouts (/opt/container_apps)
  WEB_BRANCH           Web branch to deploy (dev)
  API_BRANCH           API branch to deploy (develop)
  GITHUB_OWNER         GitHub owner of the official repositories (BIPLAT-CIBERINFEC)
  DEPLOY_MODE          test or production; passed to container_install.sh (test)
  DEPLOY_ENGINE        docker or podman (docker)
  DEPLOY_HEALTH_URLS   Space-separated public URLs that must answer below 400
  DEPLOY_STATE_DIR     Lock file and deployment log ($HOME/.local/state/pathocore-deploy)
EOF
}

# Copy this script and re-execute it from that copy: the checkout below
# replaces scripts/deploy_dev.sh itself, and Bash reads scripts while running.
if [ -z "${PATHOCORE_DEPLOY_REEXEC:-}" ]; then
    copy="$(mktemp "${TMPDIR:-/tmp}/pathocore-deploy.XXXXXX")"
    cp "$0" "$copy"
    PATHOCORE_DEPLOY_REEXEC="$copy" exec bash "$copy" "$@"
fi
trap 'rm -f "$PATHOCORE_DEPLOY_REEXEC"' EXIT

dry_run=false; force=false
while (($#)); do
    case "$1" in
        --dry-run) dry_run=true; shift ;;
        --force) force=true; shift ;;
        --help) usage; exit 0 ;;
        *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
    esac
done

if [ -n "${DEPLOY_ENV_FILE:-}" ]; then
    # shellcheck disable=SC1090
    source "$DEPLOY_ENV_FILE"
fi
DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/container_apps}"
WEB_BRANCH="${WEB_BRANCH:-dev}"
API_BRANCH="${API_BRANCH:-develop}"
GITHUB_OWNER="${GITHUB_OWNER:-BIPLAT-CIBERINFEC}"
DEPLOY_MODE="${DEPLOY_MODE:-test}"
DEPLOY_ENGINE="${DEPLOY_ENGINE:-docker}"
DEPLOY_HEALTH_URLS="${DEPLOY_HEALTH_URLS:-}"
DEPLOY_STATE_DIR="${DEPLOY_STATE_DIR:-$HOME/.local/state/pathocore-deploy}"

WEB_DIR="$DEPLOY_ROOT/pathocore-web"
API_DIR="$DEPLOY_ROOT/pathocore-api"
OMOP_DIR="$DEPLOY_ROOT/mepram-omop-api"

log() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
die() { log "ERROR: $*" >&2; exit 1; }

[ "$DEPLOY_MODE" = test ] || [ "$DEPLOY_MODE" = production ] \
    || die "DEPLOY_MODE must be test or production"
for dir in "$WEB_DIR" "$API_DIR"; do
    git -C "$dir" rev-parse --git-dir >/dev/null 2>&1 || die "Not a Git checkout: $dir"
done

mkdir -p "$DEPLOY_STATE_DIR"
exec 9>"$DEPLOY_STATE_DIR/lock"
flock -n 9 || { log "Another deployment is running; nothing to do."; exit 0; }

# Remote whose URL points at the official repository, whatever its name.
official_remote() {
    local dir="$1" repo="$2" name url
    while read -r name url _; do
        if [[ "$url" =~ github\.com[:/]${GITHUB_OWNER}/${repo}(\.git)?$ ]]; then
            echo "$name"; return 0
        fi
    done < <(git -C "$dir" remote -v)
    return 1
}

# Tracked files must be untouched; local settings are untracked or ignored.
require_clean() {
    local dir="$1"
    [ -z "$(git -C "$dir" status --porcelain --untracked-files=no)" ] \
        || die "Tracked local changes in $dir; resolve them by hand before deploying"
}

# Every GitHub check run of the commit must be completed and green.
ci_state() {
    local repo="$1" sha="$2" body
    body="$(curl -fsS --max-time 30 -H "Accept: application/vnd.github+json" \
        "https://api.github.com/repos/$GITHUB_OWNER/$repo/commits/$sha/check-runs?per_page=100")" \
        || { echo unknown; return 0; }
    python3 -c '
import json, sys
runs = json.load(sys.stdin).get("check_runs", [])
if not runs:
    print("none")
elif any(r["status"] != "completed" for r in runs):
    print("pending")
elif all(r["conclusion"] in ("success", "skipped", "neutral") for r in runs):
    print("success")
else:
    print("failure")
' <<<"$body"
}

declare -A target previous remote_of
plan() {
    local dir="$1" repo="$2" branch="$3" remote sha state
    require_clean "$dir"
    remote="$(official_remote "$dir" "$repo")" \
        || die "$dir has no remote for github.com/$GITHUB_OWNER/$repo"
    git -C "$dir" fetch --quiet "$remote" "refs/heads/$branch"
    sha="$(git -C "$dir" rev-parse FETCH_HEAD)"
    state="$(ci_state "$repo" "$sha")"
    [ "$state" = success ] || { log "$repo $branch@${sha:0:7}: checks $state; not deploying yet."; exit 0; }
    target[$repo]="$sha"; remote_of[$repo]="$remote"
    previous[$repo]="$(git -C "$dir" rev-parse HEAD)"
    log "$repo: ${previous[$repo]:0:7} -> $branch@${sha:0:7} (checks green)"
}

plan "$WEB_DIR" pathocore-web "$WEB_BRANCH"
plan "$API_DIR" pathocore-api "$API_BRANCH"
omop_head="$(git -C "$OMOP_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown)"
log "mepram-omop-api stays at $omop_head (manual updates only)."

if [ "$force" = false ] \
    && [ "${target[pathocore-web]}" = "${previous[pathocore-web]}" ] \
    && [ "${target[pathocore-api]}" = "${previous[pathocore-api]}" ]; then
    log "Already deployed; nothing to do."
    exit 0
fi
if [ "$dry_run" = true ]; then
    log "Dry run: no checkout and no upgrade."
    exit 0
fi

checkout_all() {
    git -C "$API_DIR" checkout --quiet --detach "$1"
    git -C "$WEB_DIR" checkout --quiet --detach "$2"
}

upgrade_and_check() {
    local mode_flag=() url code
    [ "$DEPLOY_MODE" = test ] && mode_flag=(--test)
    (cd "$WEB_DIR" && bash container_install.sh "${mode_flag[@]}" --action upgrade \
        --engine "$DEPLOY_ENGINE" --git_revision current) || return 1
    for url in $DEPLOY_HEALTH_URLS; do
        code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 "$url" || echo 000)"
        log "health $url -> $code"
        [ "$code" -ge 200 ] && [ "$code" -lt 400 ] || return 1
    done
}

record() { printf '%s web=%s api=%s omop=%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    "${1:0:12}" "${2:0:12}" "$omop_head" "$3" >>"$DEPLOY_STATE_DIR/deployments.log"; }

checkout_all "${target[pathocore-api]}" "${target[pathocore-web]}"
if upgrade_and_check; then
    record "${target[pathocore-web]}" "${target[pathocore-api]}" deployed
    log "Deployment succeeded."
    exit 0
fi

log "Deployment failed; rolling back to the previous revisions."
checkout_all "${previous[pathocore-api]}" "${previous[pathocore-web]}"
if upgrade_and_check; then
    record "${previous[pathocore-web]}" "${previous[pathocore-api]}" rolled-back
    die "Rolled back to web=${previous[pathocore-web]:0:7} api=${previous[pathocore-api]:0:7}"
fi
record "${previous[pathocore-web]}" "${previous[pathocore-api]}" rollback-failed
die "Rollback also failed; the stack needs manual attention"
