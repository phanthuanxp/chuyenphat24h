#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env}"
BACKUP_PREFIX="${BACKUP_PREFIX:-chuyenphat24h}"

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

if [ -f "$ENV_FILE" ]; then
  DATABASE_URL="${DATABASE_URL:-$(read_env_value DATABASE_URL)}"
  BACKUP_DIR="${BACKUP_DIR:-$(read_env_value BACKUP_DIR)}"
  BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-$(read_env_value BACKUP_RETENTION_DAYS)}"
fi

BACKUP_DIR="${BACKUP_DIR:-/var/backups/chuyenphat24h}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

if [[ ! "$BACKUP_RETENTION_DAYS" =~ ^[0-9]+$ ]]; then
  echo "[backup] BACKUP_RETENTION_DAYS must be a non-negative integer" >&2
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  if [ "${BACKUP_SKIP_IF_NO_DATABASE:-false}" = "true" ]; then
    echo "[backup] DATABASE_URL is not configured; skipping PostgreSQL backup"
    exit 0
  fi
  echo "[backup] DATABASE_URL is required (environment or $ENV_FILE)" >&2
  exit 1
fi

for command_name in pg_dump pg_restore sha256sum flock; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "[backup] missing required command: $command_name" >&2
    exit 1
  fi
done

umask 077
mkdir -p "$BACKUP_DIR"

exec 9>"$BACKUP_DIR/.backup.lock"
if ! flock -n 9; then
  echo "[backup] another backup is already running" >&2
  exit 1
fi

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive_name="$BACKUP_PREFIX-$timestamp.dump"
archive_path="$BACKUP_DIR/$archive_name"
temporary_path="$BACKUP_DIR/.$archive_name.$$.tmp"

cleanup() {
  rm -f -- "$temporary_path"
}
trap cleanup EXIT

echo "[backup] creating $archive_path"
pg_dump \
  --dbname="$DATABASE_URL" \
  --format=custom \
  --compress=6 \
  --no-owner \
  --no-privileges \
  --file="$temporary_path"

if [ ! -s "$temporary_path" ]; then
  echo "[backup] pg_dump produced an empty archive" >&2
  exit 1
fi

pg_restore --list "$temporary_path" >/dev/null
mv -- "$temporary_path" "$archive_path"
(
  cd "$BACKUP_DIR"
  sha256sum "$archive_name" > "$archive_name.sha256"
)

find "$BACKUP_DIR" -maxdepth 1 -type f \
  \( -name "$BACKUP_PREFIX-*.dump" -o -name "$BACKUP_PREFIX-*.dump.sha256" \) \
  -mtime "+$BACKUP_RETENTION_DAYS" -delete

trap - EXIT
echo "[backup] verified archive and checksum: $archive_path"
