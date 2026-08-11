import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const script = readFileSync(new URL("../deploy/migrate-json-to-postgres.sh", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/migrate-production-storage.yml", import.meta.url), "utf8");

test("production cutover backs up JSON and rolls env back on failure", () => {
  assert.match(script, /json-before-postgres-/);
  assert.match(script, /sha256sum "\$json_archive"/);
  assert.match(script, /sudo -n true/);
  assert.match(script, /restoring previous \.env/);
  assert.match(script, /cutover_complete/);
  assert.match(script, /app_records is empty/);
  assert.doesNotMatch(script, /source "\$ENV_FILE"/);
});

test("migration workflow requires an exact confirmation and production environment", () => {
  assert.match(workflow, /MIGRATE_TO_POSTGRES/);
  assert.match(workflow, /environment: production/);
  assert.match(workflow, /VPS_SSH_PRIVATE_KEY/);
  assert.match(workflow, /"storage":"postgres"/);
});
