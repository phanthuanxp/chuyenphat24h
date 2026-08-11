# PostgreSQL Backup & Recovery

Quy trinh nay bao ve du lieu don hang, audit log va notification outbox dang luu trong bang `app_records`.

## Nguyen tac

- Backup custom archive bang `pg_dump`, khong ghi password ra log.
- Chi publish file backup sau khi `pg_restore --list` xac nhan archive doc duoc.
- Tao file SHA-256 di kem de phat hien file bi thay doi.
- Dung `flock` de ngan hai backup chay cung luc.
- Mac dinh giu 14 ngay; co the doi bang `BACKUP_RETENTION_DAYS`.
- Moi lan deploy se tao mot backup truoc khi reload PM2. Dat `PREDEPLOY_BACKUP_ENABLED=false` chi khi co ly do van hanh ro rang.
- Neu `.env` chua co `BACKUP_DIR`, pre-deploy backup dung `storage/backups` de lan nang cap dau tien khong phu thuoc quyen ghi `/var/backups`. Cau hinh systemd ben duoi van dung thu muc production rieng `/var/backups/chuyenphat24h`.

## Cai dat tren VPS

Neu production dang bao `storage: json`, co the dung workflow thu cong `Migrate production storage to PostgreSQL`. Workflow chi chay khi nhap dung `MIGRATE_TO_POSTGRES`, backup tat ca JSON truoc khi doi `.env`, tu rollback `.env` neu health check/import that bai va dung GitHub environment `production`.

Package PostgreSQL da cung cap `pg_dump` va `pg_restore`. Kiem tra:

```bash
pg_dump --version
pg_restore --version
```

Tao thu muc backup chi deployment user doc duoc:

```bash
sudo install -d -m 0700 -o deploy -g deploy /var/backups/chuyenphat24h
```

Hai systemd unit mau gia dinh:

- repository: `/var/www/chuyenphat24h`
- user/group: `deploy`
- backup: `/var/backups/chuyenphat24h`

Neu VPS dung gia tri khac, sua unit truoc khi copy:

```bash
sudo cp deploy/systemd/chuyenphat24h-backup.service /etc/systemd/system/
sudo cp deploy/systemd/chuyenphat24h-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now chuyenphat24h-backup.timer
```

Chay thu ngay sau khi cai:

```bash
sudo systemctl start chuyenphat24h-backup.service
sudo systemctl status chuyenphat24h-backup.service
sudo journalctl -u chuyenphat24h-backup.service -n 100 --no-pager
sudo systemctl list-timers chuyenphat24h-backup.timer
```

Kiem tra file:

```bash
sudo -u deploy ls -lh /var/backups/chuyenphat24h
sudo -u deploy sh -c 'cd /var/backups/chuyenphat24h && sha256sum --check chuyenphat24h-*.dump.sha256'
```

Nen sao chep backup da ma hoa sang mot may/vung luu tru khac. Backup chi nam tren cung VPS khong bao ve duoc su co mat o dia.

## Backup thu cong

```bash
cd /var/www/chuyenphat24h
APP_DIR=$PWD bash deploy/backup-postgres.sh
```

Tuy chon:

```bash
BACKUP_DIR=/mnt/encrypted-backups BACKUP_RETENTION_DAYS=30 bash deploy/backup-postgres.sh
```

## Restore co kiem soat

Restore se:

1. Tu choi neu thieu chuoi xac nhan.
2. Kiem tra archive va bat buoc checksum hop le.
3. Tao safety backup cua database hien tai.
4. Tam dung PM2 de ngan ghi moi.
5. Restore trong mot transaction, khoi dong lai ung dung va chay health check.

Lenh mau:

```bash
cd /var/www/chuyenphat24h
BACKUP_FILE=/var/backups/chuyenphat24h/chuyenphat24h-20260811T020000Z.dump \
RESTORE_CONFIRM=RESTORE_CHUYENPHAT24H \
APP_DIR=$PWD \
bash deploy/restore-postgres.sh
```

Archive cu khong co checksum bi tu choi mac dinh. Chi trong tinh huong cuu ho du lieu da duoc phe duyet moi dat `ALLOW_MISSING_CHECKSUM=true`. Co the doi URL kiem tra bang `RESTORE_HEALTHCHECK_URL`.

Sau restore:

```bash
curl --fail http://127.0.0.1:3010/api/health
pm2 logs chuyenphat24h --lines 100
```

Thuc hien restore tren production chi trong cua so bao tri va sau khi nguoi phu trach phe duyet file backup cu the.

## Dien tap khoi phuc

It nhat moi thang mot lan, restore backup moi nhat vao database tam, khoi dong mot instance app tam va kiem tra:

- so luong don hang;
- audit log cua mot don mau;
- notification jobs khong bi mat;
- tra cuu public khong lo du lieu noi bo.

Backup chua duoc dien tap restore thi chua duoc xem la backup da xac minh hoan chinh.
