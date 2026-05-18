CREATE TABLE IF NOT EXISTS ad_spend (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    date TEXT NOT NULL,
    campaign_id TEXT NOT NULL,
    campaign_name TEXT,
    ad_id TEXT,
    ad_name TEXT,
    spend_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    synced_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ad_spend_unique
    ON ad_spend(platform, date, campaign_id, COALESCE(ad_id, ''));

CREATE INDEX IF NOT EXISTS idx_ad_spend_date ON ad_spend(date);
CREATE INDEX IF NOT EXISTS idx_ad_spend_platform_date ON ad_spend(platform, date);
