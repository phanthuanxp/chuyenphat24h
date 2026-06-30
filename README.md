# Chuyen Phat 24H

Web app MVP cho dich vu chuyen phat hoa toc lien tinh tu Ha Noi di cac tinh va tu tinh ve Ha Noi.

Stack hien tai:

- Vite + React + TypeScript cho frontend SPA.
- Express + TypeScript cho API noi bo.
- PostgreSQL production storage khi co `DATABASE_URL`, fallback JSON file khi chua cau hinh DB.
- Mock Maps provider, mock Zalo dispatch.

## Cai dat

```bash
npm install
cp .env.example .env
```

## Chay local

```bash
npm run dev
```

Mac dinh app chay tai `http://localhost:3000` neu khong set `PORT`. VPS production dang dung `PORT=3010`.

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

- `PORT=3010` tren VPS production
- `MAPS_PROVIDER=mock`
- `MAPS_API_BASE_URL=`
- `MAPS_API_KEY=`
- `DATABASE_URL=`
- `DATABASE_SSL=false`
- `TELEGRAM_BOT_TOKEN=`
- `TELEGRAM_ADMIN_CHAT_ID=`
- `TELEGRAM_WEBHOOK_SECRET=`
- `TELEGRAM_NOTIFY_MODE=auto`
- `TELEGRAM_SEND_TIMEOUT_MS=5000`
- `PUBLIC_APP_URL=https://chuyenphat24h.com`
- `ZALO_APP_ID=`
- `ZALO_APP_SECRET=`
- `ZALO_WEBHOOK_SECRET=`
- `ZALO_NOTIFY_MODE=mock`
- `ZALO_SEND_MESSAGE_ENDPOINT=`
- `ZALO_ACCESS_TOKEN=`
- `ZALO_ADMIN_USER_ID=`
- `ZALO_ADMIN_USER_IDS=`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=...`
- `ADMIN_SESSION_SECRET=...`
- `CP24H_STORAGE_DIR=storage`

Khong dua `.env` that vao git.

## Module chinh

- `src/lib/types`: domain model cho Order, Customer, ZaloRouteGroup, DriverPartner, PricingRule.
- `src/lib/maps`: Maps adapter, mock provider, real provider placeholder, route classifier.
- `src/lib/orders`: tao don nhanh, order service voi PostgreSQL/JSON storage.
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
4. Don duoc luu vao PostgreSQL production neu co `DATABASE_URL`, fallback JSON storage neu chua cau hinh DB, kem anh san pham va co `orderCode`.
5. He thong gui lead moi ve kenh Zalo admin, dong thoi tao notification log.
6. Admin thao tac tren Zalo de bao gia/chot lich: `GIA CP24H-xxxx 250000 14h hom nay`.
7. He thong gui bao gia va lich lay hang qua Zalo cho khach.
8. Khach xac nhan tren Zalo bang cu phap `DONG Y CP24H-xxxx`.
9. Admin dieu phoi xe ben ngoai, sau do gui thong tin xe qua Zalo: `XE CP24H-xxxx Nha xe ABC - 098xxxxxxx - xe tai nho - 15h30`.
10. Khach tra cuu public bang ma don va so dien thoai neu can.

## Zalo-first workflow

- `POST /api/zalo/webhook?secret=...` nhan tin nhan webhook tu Zalo OA.
- Neu `senderId` nam trong `ZALO_ADMIN_USER_IDS`, he thong xu ly nhu lenh admin.
- Neu khong phai admin, he thong xu ly nhu phan hoi cua khach.
- `POST /api/zalo/admin-command` dung de test lenh Zalo trong noi bo khi da dang nhap AdminCP.
- `GET /api/notification/logs` trong AdminCP/API tra ve log Telegram/Zalo.

Lenh Zalo admin:

- `HELP` xem huong dan.
- `MOI` xem lead moi.
- `CT CP24H-xxxx` xem chi tiet don.
- `GIA CP24H-xxxx 250000 14h hom nay` gui bao gia va lich lay hang cho khach.
- `OK CP24H-xxxx` danh dau khach da xac nhan neu admin can ghi nhan thu cong.
- `XE CP24H-xxxx <thong tin xe>` gui thong tin xe van chuyen cho khach.
- `NOTE CP24H-xxxx <ghi chu>` them ghi chu noi bo.
- `HUY CP24H-xxxx <ly do>` huy don.

Ket noi Zalo thuc:

- Mac dinh `ZALO_NOTIFY_MODE=mock`, he thong ghi log va khong goi API Zalo that.
- Khi co Zalo OA/API production, set `ZALO_NOTIFY_MODE=live`, `ZALO_SEND_MESSAGE_ENDPOINT`, `ZALO_ACCESS_TOKEN`, `ZALO_ADMIN_USER_IDS`.
- `ZALO_WEBHOOK_SECRET` dung de bao ve webhook tren domain live.

Telegram van co the giu lam kenh du phong, nhung workflow chinh la Zalo.

## Ghi chu production

Du lieu production:

- Khi co `DATABASE_URL`, server tu tao bang `app_records` va luu orders, dispatch logs, notification logs, partner applications vao PostgreSQL.
- Neu DB trong, app seed du lieu tu JSON storage hien co de chuyen doi an toan.
- Khi chua co `DATABASE_URL`, app tiep tuc fallback ve JSON trong `CP24H_STORAGE_DIR`.

Phan dang mock:

- Maps API thuc.
- Zalo OA send-message endpoint/token thuc neu chua cau hinh.
- Logging/monitoring.

Ban hien tai da co AdminCP login bang env va PostgreSQL production storage neu VPS set `DATABASE_URL`. Truoc khi van hanh lon can noi provider Maps server-side, webhook Zalo neu API ho tro va giam sat loi runtime.
