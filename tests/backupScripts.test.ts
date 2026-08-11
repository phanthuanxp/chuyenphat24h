import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const backupScript = readFileSync(new URL("../deploy/backup-postgres.sh", import.meta.url), "utf8");
const restoreScript = readFileSync(new URL("../deploy/restore-postgres.sh", import.meta.url), "utf8");

test("backup archive is atomic, validated and checksummed", () => {
  assert.match(backupScript, /flock -n/);
  assert.match(backupScript, /pg_restore --list "\$temporary_path"/);
  assert.match(backupScript, /mv -- "\$temporary_path" "\$archive_path"/);
  assert.match(backupScript, /sha256sum "\$archive_name"/);
  assert.match(backupScript, /BACKUP_RETENTION_DAYS/);
  assert.match(backupScript, /BACKUP_SKIP_IF_NO_DATABASE/);
  assert.doesNotMatch(backupScript, /source "\$ENV_FILE"/);
});

test("restore requires explicit confirmation and uses a transaction", () => {
  assert.match(restoreScript, /RESTORE_CONFIRM.*RESTORE_CHUYENPHAT24H/);
  assert.match(restoreScript, /creating safety backup before restore/);
  assert.match(restoreScript, /sha256sum --check/);
  assert.match(restoreScript, /ALLOW_MISSING_CHECKSUM/);
  assert.match(restoreScript, /--single-transaction/);
  assert.match(restoreScript, /pm2 stop/);
  assert.match(restoreScript, /post-restore health check failed/);
  assert.doesNotMatch(restoreScript, /source "\$ENV_FILE"/);
});
