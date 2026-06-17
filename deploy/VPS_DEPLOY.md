# Deploy Chuyen Phat 24H Len VPS

Tai lieu nay gia dinh VPS dung Ubuntu 22.04/24.04, Node.js 20+, Nginx va PM2.

## 1. Cai dat goi he thong

```bash
sudo apt update
sudo apt install -y git nginx curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Kiem tra:

```bash
node -v
npm -v
pm2 -v
nginx -v
```

## 2. Clone repo

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/phanthuanxp/chuyenphat24h.git
cd chuyenphat24h
git checkout codex/production-core-upgrade
```

Sau khi merge vao `main`, co the checkout `main` thay cho branch tren.

## 3. Cau hinh env

```bash
cp .env.example .env
nano .env
```

Gia tri toi thieu:

```bash
NODE_ENV=production
PORT=3000
MAPS_PROVIDER=mock
```

Khong dua `.env` len git.

## 4. Cai dependencies va build

```bash
npm ci
npm run build
mkdir -p logs
```

## 5. Chay bang PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Sau khi chay `pm2 startup`, PM2 se in ra mot lenh `sudo env PATH=... pm2 startup ...`; copy va chay lenh do mot lan.

Kiem tra:

```bash
pm2 status
pm2 logs chuyenphat24h
curl http://127.0.0.1:3000/api/health
```

## 6. Cau hinh Nginx

Copy file cau hinh:

```bash
sudo cp deploy/nginx/chuyenphat24h.conf /etc/nginx/sites-available/chuyenphat24h.conf
sudo ln -s /etc/nginx/sites-available/chuyenphat24h.conf /etc/nginx/sites-enabled/chuyenphat24h.conf
sudo nginx -t
sudo systemctl reload nginx
```

Neu VPS dang co default site:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Tro domain

Trong DNS cua domain:

- `A @` tro ve IP VPS
- `A www` tro ve IP VPS

Lam tuong tu cho `chuyenphat24h.vn` neu dung ca hai domain.

## 8. Cai SSL Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d chuyenphat24h.com -d www.chuyenphat24h.com
```

Neu dung ca domain `.vn`:

```bash
sudo certbot --nginx -d chuyenphat24h.vn -d www.chuyenphat24h.vn
```

Kiem tra renew:

```bash
sudo certbot renew --dry-run
```

## 9. Deploy update sau nay

```bash
cd /var/www/chuyenphat24h
git pull
npm ci
npm run build
pm2 restart chuyenphat24h
pm2 save
```

Hoac dung script deploy co dinh cho OpenClaw/agent:

```bash
APP_DIR=/var/www/chuyenphat24h BRANCH=main APP_NAME=chuyenphat24h bash deploy/deploy.sh
```

Neu dang deploy branch nang cap truoc khi merge:

```bash
APP_DIR=/var/www/chuyenphat24h BRANCH=codex/production-core-upgrade APP_NAME=chuyenphat24h bash deploy/deploy.sh
```

## 10. Healthcheck

```bash
curl https://chuyenphat24h.com/api/health
```

Ket qua dung co dang:

```json
{
  "status": "ok",
  "app": "Chuyen Phat 24H",
  "stack": "Vite + React + Express"
}
```

## 11. Nhung phan dang mock

- Database hien dang in-memory, restart server se mat don moi.
- Maps dang la mock provider.
- Zalo dispatch dang la mock log, chua gui Zalo that.
- Admin chua co auth.

Truoc khi chay production that can uu tien: database + auth admin + logging.
