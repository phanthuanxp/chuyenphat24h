# OpenClaw Deploy Guide

Use this guide when OpenClaw updates the running VPS after code is pushed to GitHub.

## Safe Command

Ask OpenClaw to SSH into the VPS and run only this command:

```bash
APP_DIR=/var/www/chuyenphat24h BRANCH=main APP_NAME=chuyenphat24h bash /var/www/chuyenphat24h/deploy/deploy.sh
```

If deploying the current upgrade branch before merge:

```bash
APP_DIR=/var/www/chuyenphat24h BRANCH=codex/production-core-upgrade APP_NAME=chuyenphat24h bash /var/www/chuyenphat24h/deploy/deploy.sh
```

## Recommended OpenClaw Prompt

```text
SSH into the VPS for chuyenphat24h.
Go to /var/www/chuyenphat24h.
Run the repository deploy script only:
APP_DIR=/var/www/chuyenphat24h BRANCH=main APP_NAME=chuyenphat24h bash deploy/deploy.sh
After it finishes, check:
curl https://chuyenphat24h.com/api/health
Do not edit .env, nginx, firewall, or system packages unless I explicitly approve.
```

## Safety Rules

- Do not expose `.env`.
- Do not run `npm audit fix --force` during deploy.
- Do not change Nginx or SSL during routine deploys.
- Do not use root for normal app updates if a deploy user exists.
- If build fails, stop and report logs instead of forcing restart.

## What The Script Does

1. Fetches the target branch.
2. Fast-forwards the working tree.
3. Runs `npm ci`.
4. Runs `npm run build`.
5. Starts or reloads PM2.
6. Saves PM2 state.
7. Calls local `/api/health`.

