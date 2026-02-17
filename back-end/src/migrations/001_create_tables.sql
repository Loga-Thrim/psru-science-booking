-- Migration: Create all tables for PSRU Booking System
-- Run this script on an empty database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_id CHAR(8) PRIMARY KEY DEFAULT (UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 8))),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  department VARCHAR(255) NOT NULL,
  role VARCHAR(18) NOT NULL DEFAULT 'user'
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  room_id CHAR(8) PRIMARY KEY DEFAULT (UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 8))),
  room_code VARCHAR(50) NOT NULL UNIQUE,
  capacity INT NOT NULL,
  description TEXT,
  room_type VARCHAR(100) NOT NULL,
  equipment TEXT,
  caretaker VARCHAR(255),
  status VARCHAR(255)
);

-- Create room_images table
CREATE TABLE IF NOT EXISTS room_images (
  image_id CHAR(8) PRIMARY KEY DEFAULT (UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 8))),
  room_id CHAR(8) NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  CONSTRAINT fk_room_images_room
    FOREIGN KEY (room_id)
    REFERENCES rooms(room_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  reservation_id CHAR(8) PRIMARY KEY DEFAULT (UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 8))),
  room_id CHAR(8),
  user_id CHAR(8),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  number_of_users INT NOT NULL,
  reservation_type VARCHAR(100),
  reservation_status VARCHAR(100) NOT NULL DEFAULT 'pending',
  reservation_reason TEXT,
  rejection_reason TEXT,
  phone CHAR(10),
  CONSTRAINT fk_reservations_room
    FOREIGN KEY (room_id)
    REFERENCES rooms(room_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_reservations_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
