#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env}"
APP_NAME="${APP_NAME:-chuyenphat24h}"
RESTORE_CONFIRM="${RESTORE_CONFIRM:-}"
BACKUP_FILE="${BACKUP_FILE:-${1:-}}"
CREATE_SAFETY_BACKUP="${CREATE_SAFETY_BACKUP:-true}"
PAUSE_APP_DURING_RESTORE="${PAUSE_APP_DURING_RESTORE:-true}"
ALLOW_MISSING_CHECKSUM="${ALLOW_MISSING_CHECKSUM:-false}"
RESTORE_HEALTHCHECK_URL="${RESTORE_HEALTHCHECK_URL:-http://127.0.0.1:${PORT:-3010}/api/health}"

read_env_value() {
  local key="$1"
  local line value
  line="$(grep -m 1 -E "^${key}=" "$ENV_FILE" 2>/dev/null || true)"
  value="${line#*=}"
  value="${value%$'\r'}"
  if [[ "$value" =~ ^\".*\"$ ]] || [[ "$value" =~ ^\'.*\'$ ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s' "$value"
}

if [ "$RESTORE_CONFIRM" != "RESTORE_CHUYENPHAT24H" ]; then
  echo "[restore] refusing restore; set RESTORE_CONFIRM=RESTORE_CHUYENPHAT24H" >&2
  exit 1
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "[restore] BACKUP_FILE must point to an existing .dump archive" >&2
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ] && [ -f "$ENV_FILE" ]; then
  DATABASE_URL="$(read_env_value DATABASE_URL)"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[restore] DATABASE_URL is required (environment or $ENV_FILE)" >&2
  exit 1
fi

for command_name in pg_restore; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "[restore] missing required command: $command_name" >&2
    exit 1
  fi
done

pg_restore --list "$BACKUP_FILE" >/dev/null

checksum_file="$BACKUP_FILE.sha256"
if [ -f "$checksum_file" ]; then
  if ! command -v sha256sum >/dev/null 2>&1; then
    echo "[restore] sha256sum is required to verify $checksum_file" >&2
    exit 1
  fi
  (
    cd "$(dirname "$BACKUP_FILE")"
    sha256sum --check "$(basename "$checksum_file")"
  )
else
  if [ "$ALLOW_MISSING_CHECKSUM" != "true" ]; then
    echo "[restore] refusing archive without checksum: $checksum_file" >&2
    exit 1
  fi
  echo "[restore] warning: checksum bypass explicitly enabled" >&2
fi

if [ "$CREATE_SAFETY_BACKUP" = "true" ]; then
  echo "[restore] creating safety backup before restore"
  APP_DIR="$APP_DIR" ENV_FILE="$ENV_FILE" bash "$SCRIPT_DIR/backup-postgres.sh"
fi

app_was_paused=0
resume_app() {
  exit_code=$?
  trap - EXIT
  if [ "$app_was_paused" -eq 1 ]; then
    pm2 restart "$APP_NAME" --update-env || true
  fi
  exit "$exit_code"
}
trap resume_app EXIT

if [ "$PAUSE_APP_DURING_RESTORE" = "true" ] && command -v pm2 >/dev/null 2>&1 && pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  echo "[restore] pausing $APP_NAME to prevent writes during restore"
  pm2 stop "$APP_NAME"
  app_was_paused=1
fi

echo "[restore] restoring verified archive $BACKUP_FILE"
pg_restore \
  --dbname="$DATABASE_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --single-transaction \
  "$BACKUP_FILE"

if [ "$app_was_paused" -eq 1 ]; then
  pm2 restart "$APP_NAME" --update-env
  app_was_paused=0
fi

if [ -n "$RESTORE_HEALTHCHECK_URL" ]; then
  if ! command -v curl >/dev/null 2>&1; then
    echo "[restore] curl is required for the post-restore health check" >&2
    exit 1
  fi

  health_ok=0
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if curl --fail --silent --show-error "$RESTORE_HEALTHCHECK_URL" >/dev/null; then
      health_ok=1
      break
    fi
    echo "[restore] healthcheck attempt $attempt failed; retrying..." >&2
    sleep 2
  done
  if [ "$health_ok" -ne 1 ]; then
    echo "[restore] post-restore health check failed" >&2
    exit 1
  fi
fi

trap - EXIT
echo "[restore] restore and health check completed"
