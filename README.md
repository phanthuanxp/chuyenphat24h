# Chuyen Phat 24H

Web app MVP cho dich vu chuyen phat hoa toc lien tinh tu Ha Noi di cac tinh va tu tinh ve Ha Noi.

Stack hien tai:

- Vite + React + TypeScript cho frontend SPA.
- Express + TypeScript cho API noi bo.
- Mock Maps provider, mock Zalo dispatch, in-memory orders.

## Cai dat

```bash
npm install
cp .env.example .env
```

## Chay local

```bash
npm run dev
```

Mac dinh app chay tai `http://localhost:3000`.

## Build va chay production tren VPS

```bash
npm run build
npm run start
```

Nen dung PM2 tren VPS:

```bash
pm2 start dist/server.cjs --name chuyenphat24h
pm2 save
```

Khuyen nghi dung file PM2 san co:

```bash
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
```

Huong dan day du nam trong `deploy/VPS_DEPLOY.md`.

## Bien moi truong

Quan trong nhat trong MVP:

- `PORT=3000`
- `MAPS_PROVIDER=mock`
- `MAPS_API_BASE_URL=`
- `MAPS_API_KEY=`
- `DATABASE_URL=`
- `TELEGRAM_BOT_TOKEN=`
- `TELEGRAM_ADMIN_CHAT_ID=`
- `TELEGRAM_WEBHOOK_SECRET=`
- `ZALO_APP_ID=`
- `ZALO_APP_SECRET=`
- `ZALO_WEBHOOK_SECRET=`
- `ZALO_CUSTOMER_NOTIFY_MODE=mock`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=...`
- `ADMIN_SESSION_SECRET=...`
- `CP24H_STORAGE_DIR=storage`

Khong dua `.env` that vao git.

## Module chinh

- `src/lib/types`: domain model cho Order, Customer, ZaloRouteGroup, DriverPartner, PricingRule.
- `src/lib/maps`: Maps adapter, mock provider, real provider placeholder, route classifier.
- `src/lib/orders`: tao don nhanh, order service in-memory.
- `src/lib/pricing`: dinh gia va manual quote rules.
- `src/lib/dispatch`: AI dispatch mock, preview va send mock vao group Zalo.
- `src/lib/zalo`: group service va bot command parser.
- `src/lib/tracking`: public tracking, an du lieu noi bo.
- `src/lib/partners`: dang ky doi tac doi xe.
- `src/data`: mock orders, routes, pricing, Zalo groups, partners, maps.

## Luong nghiep vu MVP

1. Khach tao don tren website.
2. Frontend goi API noi bo de autocomplete dia chi mock Maps.
3. API phan tuyen, tinh khoang cach mock va tao `quotedPrice` la gia de xuat.
4. Don duoc luu vao JSON storage, kem anh san pham va co `orderCode`.
5. He thong tao notification log Telegram admin va bat dau goi y xe gan nhat.
6. Admin duyet gia cuoi trong AdminCP hoac qua Telegram webhook mock: `DUYET CP24H-xxxx 250000`.
7. Sau khi duyet, he thong tao log gui Zalo khach ve gia chinh thuc.
8. Admin bam tim/giao xe gan nhat hoac Telegram `TIMXE CP24H-xxxx`; he thong gan xe va tao log gui Zalo khach.
9. Khach tra cuu public bang ma don va so dien thoai.

## Telegram/Zalo mock workflow

- `POST /api/telegram/webhook?secret=...` nhan lenh `DUYET`, `GIA`, `TIMXE`.
- `GET /api/notification/logs` trong AdminCP/API tra ve log Telegram/Zalo mock.
- Khi co token that, thay cac ham trong `src/lib/notification/notificationService.ts` bang Telegram Bot API va Zalo OA API.

## Ghi chu production

Phan dang mock:

- Maps API thuc.
- Zalo OA/group integration thuc.
- Database SQL thuc.
- Logging/monitoring.

Ban hien tai da co AdminCP login bang env va storage JSON tren VPS. Truoc khi van hanh lon can noi database SQL, provider Maps server-side, webhook Zalo neu API ho tro va giam sat loi runtime.
