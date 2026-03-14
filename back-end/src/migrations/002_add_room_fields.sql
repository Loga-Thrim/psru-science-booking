-- Migration: Add new fields to rooms table for university faculty room booking system
-- Run this script after 001_create_tables.sql

-- Add new columns to rooms table (IF NOT EXISTS workaround for MySQL)
SET @dbname = DATABASE();

-- Add building column if not exists
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'building') = 0,
  'ALTER TABLE rooms ADD COLUMN building VARCHAR(255) AFTER room_code',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add floor column if not exists
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'floor') = 0,
  'ALTER TABLE rooms ADD COLUMN floor VARCHAR(50) AFTER building',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add contact_phone column if not exists
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'contact_phone') = 0,
  'ALTER TABLE rooms ADD COLUMN contact_phone VARCHAR(50) AFTER caretaker',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add available_start_time column if not exists
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'available_start_time') = 0,
  'ALTER TABLE rooms ADD COLUMN available_start_time TIME DEFAULT ''08:00:00'' AFTER contact_phone',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add available_end_time column if not exists
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'available_end_time') = 0,
  'ALTER TABLE rooms ADD COLUMN available_end_time TIME DEFAULT ''17:00:00'' AFTER available_start_time',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add available_days column if not exists
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'available_days') = 0,
  'ALTER TABLE rooms ADD COLUMN available_days VARCHAR(100) DEFAULT ''mon,tue,wed,thu,fri'' AFTER available_end_time',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add advance_booking_days column if not exists
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'advance_booking_days') = 0,
  'ALTER TABLE rooms ADD COLUMN advance_booking_days INT DEFAULT 3 AFTER available_days',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add restrictions column if not exists
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'restrictions') = 0,
  'ALTER TABLE rooms ADD COLUMN restrictions TEXT AFTER advance_booking_days',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Update existing rooms with default values
UPDATE rooms SET 
  building = 'อาคาร 1 (อาคารเรียนรวม)',
  floor = '1',
  available_start_time = '08:00:00',
  available_end_time = '17:00:00',
  available_days = 'mon,tue,wed,thu,fri',
  advance_booking_days = 3
WHERE building IS NULL;
