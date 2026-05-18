ALTER TABLE purchase_log ADD COLUMN meta_payload_sent TEXT;
ALTER TABLE purchase_log ADD COLUMN ga4_payload_sent TEXT;
ALTER TABLE purchase_log ADD COLUMN google_ads_payload_sent TEXT;
ALTER TABLE purchase_log ADD COLUMN ga4_response_body TEXT;
