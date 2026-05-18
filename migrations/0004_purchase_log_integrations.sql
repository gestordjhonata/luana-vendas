ALTER TABLE purchase_log ADD COLUMN product_id TEXT;
ALTER TABLE purchase_log ADD COLUMN product_name TEXT;
ALTER TABLE purchase_log ADD COLUMN encharge_status_code INTEGER;
ALTER TABLE purchase_log ADD COLUMN encharge_response_ok INTEGER DEFAULT 0;
ALTER TABLE purchase_log ADD COLUMN encharge_response_body TEXT;
ALTER TABLE purchase_log ADD COLUMN manychat_status_code INTEGER;
ALTER TABLE purchase_log ADD COLUMN manychat_response_ok INTEGER DEFAULT 0;
ALTER TABLE purchase_log ADD COLUMN manychat_response_body TEXT;
CREATE INDEX IF NOT EXISTS idx_purchase_log_product_id ON purchase_log(product_id);
