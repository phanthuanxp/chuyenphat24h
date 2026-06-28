# Checklist Deploy

- [ ] Merge hoac checkout dung branch can deploy.
- [ ] VPS co Node.js 20+, npm, git, nginx, pm2.
- [ ] `.env` da tao tu `.env.example`.
- [ ] `.env` da doi `ADMIN_PASSWORD` va `ADMIN_SESSION_SECRET`.
- [ ] PostgreSQL database da tao va `.env` da set `DATABASE_URL`.
- [ ] Thu muc `storage/` ton tai va khong bi xoa khi deploy.
- [ ] `npm ci` thanh cong.
- [ ] `npm run build` thanh cong.
- [ ] `pm2 start ecosystem.config.cjs` thanh cong.
- [ ] `curl http://127.0.0.1:3010/api/health` tra `status: ok` va `storage: postgres`.
- [ ] DNS domain tro ve IP VPS.
- [ ] Nginx config da copy va `nginx -t` pass.
- [ ] SSL Let's Encrypt da cai.
- [ ] `curl https://chuyenphat24h.com/api/health` pass.
- [ ] Da test tao don nhanh tren website.
- [ ] Da test tra cuu don.
- [ ] Da test admin preview dieu phoi Zalo mock.
- [ ] Neu dung OpenClaw, chi chay `deploy/deploy.sh` va khong sua `.env`/Nginx khi chua duoc duyet.
