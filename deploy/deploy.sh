#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/chuyenphat24h}"
BRANCH="${BRANCH:-main}"
APP_NAME="${APP_NAME:-chuyenphat24h}"

cd "$APP_DIR"

echo "[deploy] fetching $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "[deploy] installing dependencies"
npm ci

echo "[deploy] building app"
npm run build

mkdir -p logs
mkdir -p storage

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  echo "[deploy] reloading pm2 app $APP_NAME"
  pm2 reload "$APP_NAME" --update-env
else
  echo "[deploy] starting pm2 app $APP_NAME"
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo "[deploy] healthcheck"
curl --fail --silent --show-error "http://127.0.0.1:${PORT:-3010}/api/health"
echo
echo "[deploy] done"
