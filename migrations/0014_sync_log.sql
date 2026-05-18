CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    status TEXT NOT NULL,
    rows_upserted INTEGER DEFAULT 0,
    date_from TEXT,
    date_to TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    run_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_log_platform_run_at
    ON sync_log(platform, run_at DESC);
