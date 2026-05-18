ALTER TABLE event_log ADD COLUMN meta_status_code INTEGER DEFAULT 0;
ALTER TABLE event_log ADD COLUMN meta_payload_sent TEXT;
ALTER TABLE event_log ADD COLUMN ga4_status_code INTEGER DEFAULT 0;
ALTER TABLE event_log ADD COLUMN ga4_response_body TEXT;
ALTER TABLE event_log ADD COLUMN ga4_payload_sent TEXT;
