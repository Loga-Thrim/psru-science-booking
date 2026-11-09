-- Migration: Bookings without an account.
-- Anyone can book by giving a name and phone number, so the booker's name is
-- stored on the reservation itself. user_id stays nullable and is only set
-- when an admin books while signed in.

SET @dbname = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'reservations' AND COLUMN_NAME = 'booker_name') = 0,
  'ALTER TABLE reservations ADD COLUMN booker_name VARCHAR(255) AFTER user_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Status lookups go by phone number now.
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'reservations' AND INDEX_NAME = 'idx_reservations_phone') = 0,
  'CREATE INDEX idx_reservations_phone ON reservations (phone)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Approval is a single admin step now. Anything an admin had already passed on
-- to an approver counts as approved, otherwise nobody could ever finish it.
UPDATE reservations SET reservation_status = 'approverApproved' WHERE reservation_status = 'adminApproved';
