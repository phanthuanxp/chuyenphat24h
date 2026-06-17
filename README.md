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
- `ZALO_APP_ID=`
- `ZALO_APP_SECRET=`
- `ZALO_WEBHOOK_SECRET=`
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
3. API phan tuyen, tinh khoang cach mock, uoc tinh gia.
4. Don duoc luu in-memory va co `orderCode`.
5. Admin xem dashboard, preview tin ban don vao group Zalo.
6. Mock send tao dispatch log va cap nhat trang thai.
7. Tai xe co the dung cu phap mock nhu `NHAN CP24H-xxxx`.
8. Khach tra cuu public bang ma don va so dien thoai.

## Ghi chu production

Phan dang mock:

- Maps API thuc.
- Zalo OA/group integration thuc.
- Database SQL thuc.
- Logging/monitoring.

Ban hien tai da co AdminCP login bang env va storage JSON tren VPS. Truoc khi van hanh lon can noi database SQL, provider Maps server-side, webhook Zalo neu API ho tro va giam sat loi runtime.
