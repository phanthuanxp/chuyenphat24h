CREATE TABLE IF NOT EXISTS app_records (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  data JSONB NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS app_records_collection_sort_idx
  ON app_records (collection, sort_order);

CREATE INDEX IF NOT EXISTS app_records_collection_updated_idx
  ON app_records (collection, updated_at DESC);
