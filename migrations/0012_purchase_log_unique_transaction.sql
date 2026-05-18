CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_log_transaction_id
  ON purchase_log(transaction_id);
