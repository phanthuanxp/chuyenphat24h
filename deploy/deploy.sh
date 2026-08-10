#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/chuyenphat24h}"
BRANCH="${BRANCH:-main}"
APP_NAME="${APP_NAME:-chuyenphat24h}"
EXPECTED_SHA="${EXPECTED_SHA:-}"

cd "$APP_DIR"
PREVIOUS_SHA="$(git rev-parse HEAD)"
DEPLOY_SUCCEEDED=0

rollback() {
  exit_code=$?
  trap - EXIT
  set +e
  if [ "$DEPLOY_SUCCEEDED" -eq 0 ]; then
    echo "[deploy] failed; rolling back to $PREVIOUS_SHA"
    git checkout --detach "$PREVIOUS_SHA"
    npm ci
    npm run build
    pm2 reload "$APP_NAME" --update-env || pm2 start ecosystem.config.cjs
  fi
  exit "$exit_code"
}

trap rollback EXIT

echo "[deploy] fetching $BRANCH"
git fetch origin "$BRANCH"
TARGET_SHA="${EXPECTED_SHA:-$(git rev-parse "origin/$BRANCH")}"
git cat-file -e "$TARGET_SHA^{commit}"
git checkout --detach "$TARGET_SHA"

if [ "$(git rev-parse HEAD)" != "$TARGET_SHA" ]; then
  echo "[deploy] checked out SHA does not match expected SHA" >&2
  exit 1
fi

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
DEPLOY_SUCCEEDED=1
trap - EXIT
echo "[deploy] done"
