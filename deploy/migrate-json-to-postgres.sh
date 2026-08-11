#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/chuyenphat24h}"
APP_NAME="${APP_NAME:-chuyenphat24h}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/chuyenphat24h}"
DB_NAME="${DB_NAME:-chuyenphat24h}"
DB_USER="${DB_USER:-cp24h_user}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:${PORT:-3010}/api/health}"

cd "$APP_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "[cutover] missing production env file: $ENV_FILE" >&2
  exit 1
fi

for command_name in awk curl openssl pm2 sha256sum tar; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "[cutover] missing required command: $command_name" >&2
    exit 1
  fi
done

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

write_env_value() {
  local key="$1"
  local value="$2"
  local temporary_file
  temporary_file="$(mktemp "$APP_DIR/.env.cutover.XXXXXX")"
  awk -v key="$key" -v replacement="$key=$value" '
    BEGIN { updated = 0 }
    index($0, key "=") == 1 { print replacement; updated = 1; next }
    { print }
    END { if (!updated) print replacement }
  ' "$ENV_FILE" > "$temporary_file"
  chmod 600 "$temporary_file"
  mv -- "$temporary_file" "$ENV_FILE"
}

current_database_url="$(read_env_value DATABASE_URL)"
if [ -n "$current_database_url" ]; then
  echo "[cutover] DATABASE_URL already configured; verifying current PostgreSQL storage"
  DATABASE_URL="$current_database_url" APP_DIR="$APP_DIR" ENV_FILE="$ENV_FILE" BACKUP_DIR="$BACKUP_DIR" bash deploy/backup-postgres.sh
  exit 0
fi

if ! sudo -n true >/dev/null 2>&1; then
  echo "[cutover] deployment user needs passwordless sudo for PostgreSQL bootstrap" >&2
  exit 1
fi

umask 077
mkdir -p storage/migration-backups
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
json_archive="$APP_DIR/storage/migration-backups/json-before-postgres-$timestamp.tar.gz"

mapfile -d '' json_files < <(find "$APP_DIR/storage" -maxdepth 1 -type f -name '*.json' -print0)
if [ "${#json_files[@]}" -eq 0 ]; then
  echo "[cutover] no JSON storage files found; refusing automatic migration" >&2
  exit 1
fi

relative_files=()
for file in "${json_files[@]}"; do
  relative_files+=("storage/$(basename "$file")")
done

echo "[cutover] archiving ${#relative_files[@]} JSON files"
tar -czf "$json_archive" "${relative_files[@]}"
sha256sum "$json_archive" > "$json_archive.sha256"

if ! command -v psql >/dev/null 2>&1 || ! command -v pg_dump >/dev/null 2>&1; then
  echo "[cutover] installing PostgreSQL packages"
  sudo -n apt-get update
  sudo -n env DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
fi

sudo -n systemctl enable --now postgresql

db_password="$(openssl rand -hex 24)"
if ! sudo -n -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  sudo -n -u postgres createuser "$DB_USER"
fi
sudo -n -u postgres psql --set=ON_ERROR_STOP=1 -c "ALTER ROLE $DB_USER WITH LOGIN PASSWORD '$db_password';"

if ! sudo -n -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  sudo -n -u postgres createdb --owner="$DB_USER" "$DB_NAME"
fi
sudo -n -u postgres psql --set=ON_ERROR_STOP=1 -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"

database_url="postgresql://$DB_USER:$db_password@127.0.0.1:5432/$DB_NAME"
env_snapshot="$(mktemp "$APP_DIR/.env.before-postgres.XXXXXX")"
cp -- "$ENV_FILE" "$env_snapshot"
chmod 600 "$env_snapshot"
env_changed=0
cutover_complete=0

rollback_env() {
  exit_code=$?
  trap - EXIT
  if [ "$env_changed" -eq 1 ] && [ "$cutover_complete" -eq 0 ]; then
    echo "[cutover] failed; restoring previous .env and restarting application" >&2
    cp -- "$env_snapshot" "$ENV_FILE"
    pm2 restart "$APP_NAME" --update-env || true
  fi
  rm -f -- "$env_snapshot"
  exit "$exit_code"
}
trap rollback_env EXIT

write_env_value DATABASE_URL "$database_url"
write_env_value DATABASE_SSL false
write_env_value BACKUP_DIR "$BACKUP_DIR"
write_env_value BACKUP_RETENTION_DAYS 14
env_changed=1

echo "[cutover] restarting application to import JSON collections"
pm2 restart "$APP_NAME" --update-env

health_ok=0
for attempt in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  health_payload="$(curl --fail --silent --show-error "$HEALTHCHECK_URL" 2>/dev/null || true)"
  if printf '%s' "$health_payload" | grep -q '"storage":"postgres"'; then
    health_ok=1
    break
  fi
  echo "[cutover] PostgreSQL healthcheck attempt $attempt failed; retrying..." >&2
  sleep 2
done
if [ "$health_ok" -ne 1 ]; then
  echo "[cutover] application did not report PostgreSQL storage" >&2
  exit 1
fi

record_count="$(psql "$database_url" -tAc 'SELECT COUNT(*) FROM app_records;')"
if ! [[ "$record_count" =~ ^[[:space:]]*[1-9][0-9]*[[:space:]]*$ ]]; then
  echo "[cutover] PostgreSQL app_records is empty after migration" >&2
  exit 1
fi

sudo -n install -d -m 0700 -o "$(id -un)" -g "$(id -gn)" "$BACKUP_DIR"
DATABASE_URL="$database_url" APP_DIR="$APP_DIR" ENV_FILE="$ENV_FILE" BACKUP_DIR="$BACKUP_DIR" bash deploy/backup-postgres.sh

service_tmp="$(mktemp)"
timer_tmp="$(mktemp)"
sed \
  -e "s|User=deploy|User=$(id -un)|" \
  -e "s|Group=deploy|Group=$(id -gn)|" \
  -e "s|/var/www/chuyenphat24h|$APP_DIR|g" \
  -e "s|/var/backups/chuyenphat24h|$BACKUP_DIR|g" \
  deploy/systemd/chuyenphat24h-backup.service > "$service_tmp"
cp deploy/systemd/chuyenphat24h-backup.timer "$timer_tmp"
sudo -n install -m 0644 "$service_tmp" /etc/systemd/system/chuyenphat24h-backup.service
sudo -n install -m 0644 "$timer_tmp" /etc/systemd/system/chuyenphat24h-backup.timer
rm -f -- "$service_tmp" "$timer_tmp"
sudo -n systemctl daemon-reload
sudo -n systemctl enable --now chuyenphat24h-backup.timer

cutover_complete=1
rm -f -- "$env_snapshot"
trap - EXIT
echo "[cutover] PostgreSQL migration complete; records=$record_count; JSON archive=$json_archive"
