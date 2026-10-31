CREATE TABLE IF NOT EXISTS transactions (
  id INT NOT NULL AUTO_INCREMENT,
  account_id INT NOT NULL,
  type VARCHAR(20) NOT NULL,
  amount INT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  INDEX idx_transactions_account_date (
    account_id,
    created_at
  ),

  CONSTRAINT fk_transactions_account
    FOREIGN KEY (account_id)
    REFERENCES accounts (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;