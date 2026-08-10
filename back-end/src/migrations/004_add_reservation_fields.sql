-- Migration: Store the equipment and caretaker chosen on the booking form.
-- Before this, the frontend sent equipment_needs / caretaker_name and the backend dropped them.

SET @dbname = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'reservations' AND COLUMN_NAME = 'equipment_needs') = 0,
  'ALTER TABLE reservations ADD COLUMN equipment_needs TEXT AFTER reservation_reason',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'reservations' AND COLUMN_NAME = 'caretaker_name') = 0,
  'ALTER TABLE reservations ADD COLUMN caretaker_name VARCHAR(255) AFTER equipment_needs',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Speeds up the overlap lookup that guards against double booking.
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'reservations' AND INDEX_NAME = 'idx_reservations_room_date') = 0,
  'CREATE INDEX idx_reservations_room_date ON reservations (room_id, booking_date)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
