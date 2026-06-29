import { Pool } from "pg";

type PersistentCollection = "orders" | "dispatchLogs" | "notificationLogs" | "partnerApplications" | "themeSettings" | "seoPages";
type RowWithId = { id?: string };

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();
let storageModeLogged = false;

export function isDatabaseEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!isDatabaseEnabled()) return null;

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}

async function ensureSchema() {
  const db = getPool();
  if (!db) return;

  await db.query(`
    CREATE TABLE IF NOT EXISTS app_records (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSONB NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (collection, id)
    );
  `);
  await db.query("ALTER TABLE app_records ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;");
  await db.query("CREATE INDEX IF NOT EXISTS app_records_collection_sort_idx ON app_records (collection, sort_order);");
  await db.query("CREATE INDEX IF NOT EXISTS app_records_collection_updated_idx ON app_records (collection, updated_at DESC);");
}

export async function initializePersistentStore() {
  if (!isDatabaseEnabled()) {
    if (!storageModeLogged) {
      console.log("[storage] DATABASE_URL not set; using JSON file storage.");
      storageModeLogged = true;
    }
    return;
  }

  if (!schemaReady) {
    schemaReady = ensureSchema();
  }

  await schemaReady;
  if (!storageModeLogged) {
    console.log("[storage] PostgreSQL storage enabled.");
    storageModeLogged = true;
  }
}

function getRecordId(row: RowWithId, index: number) {
  return row.id || `row-${index}`;
}

export async function loadPersistentCollection<T extends RowWithId>(collection: PersistentCollection, fallbackRows: T[]) {
  if (!isDatabaseEnabled()) return fallbackRows;

  await initializePersistentStore();
  const db = getPool();
  if (!db) return fallbackRows;

  const result = await db.query<{ data: T }>(
    "SELECT data FROM app_records WHERE collection = $1 ORDER BY sort_order ASC, updated_at DESC",
    [collection],
  );

  if (result.rows.length) {
    return result.rows.map((row) => row.data);
  }

  if (fallbackRows.length) {
    await replacePersistentCollection(collection, fallbackRows);
  }

  return fallbackRows;
}

async function replacePersistentCollection<T extends RowWithId>(collection: PersistentCollection, rows: T[]) {
  const db = getPool();
  if (!db) return;

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM app_records WHERE collection = $1", [collection]);

    for (const [index, row] of rows.entries()) {
      await client.query(
        `
          INSERT INTO app_records (collection, id, data, sort_order, updated_at)
          VALUES ($1, $2, $3::jsonb, $4, NOW())
          ON CONFLICT (collection, id)
          DO UPDATE SET data = EXCLUDED.data, sort_order = EXCLUDED.sort_order, updated_at = NOW()
        `,
        [collection, getRecordId(row, index), JSON.stringify(row), index],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function persistCollection<T extends RowWithId>(collection: PersistentCollection, rows: T[]) {
  if (!isDatabaseEnabled()) return;

  const snapshot = rows.map((row) => ({ ...row }));
  writeQueue = writeQueue
    .then(() => replacePersistentCollection(collection, snapshot))
    .catch((error) => {
      console.error(`[storage] Failed writing ${collection} to database`, error);
    });
}
