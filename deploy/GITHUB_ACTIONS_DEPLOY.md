# GitHub Actions auto-deploy

Workflow `.github/workflows/deploy-vps.yml` deploys every successful push to `main`.

## One-time VPS preparation

The VPS must already contain the app at `/var/www/chuyenphat24h`, have Node.js 20+, PM2, and a working `.env`. Run the initial manual deploy once using `deploy/VPS_DEPLOY.md`.

Create a dedicated deployment user (for example `deploy`) that can access only this application directory and run the deploy script. Add its public SSH key to `~/.ssh/authorized_keys` on the VPS. Do not use the root password.

## Required GitHub repository secrets

In **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS IP address or hostname |
| `VPS_USER` | Dedicated deploy user, for example `deploy` |
| `VPS_SSH_PRIVATE_KEY` | Private half of the dedicated Ed25519 deployment key |
| `VPS_PORT` | SSH port; leave as `22` if unchanged |
| `CP24H_HEALTHCHECK_URL` | `https://chuyenphat24h.com/api/health` |

After the secrets exist, merge the feature branch to `main`. Configure the GitHub `production` environment with required reviewers. The workflow only deploys when its ref is `main`, validates TypeScript, tests and the production build, then passes the exact validated commit SHA to the VPS. `deploy/deploy.sh` checks out that SHA, reloads PM2, verifies local health and rolls back to the previous commit if deployment fails.
