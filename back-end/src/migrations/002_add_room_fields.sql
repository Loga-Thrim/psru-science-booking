-- Migration: Add new fields to rooms table for university faculty room booking system
-- Run this script after 001_create_tables.sql

-- Add new columns to rooms table
ALTER TABLE rooms
  ADD COLUMN building VARCHAR(255) AFTER room_code,
  ADD COLUMN floor VARCHAR(50) AFTER building,
  ADD COLUMN contact_phone VARCHAR(50) AFTER caretaker,
  ADD COLUMN available_start_time TIME DEFAULT '08:00:00' AFTER contact_phone,
  ADD COLUMN available_end_time TIME DEFAULT '17:00:00' AFTER available_start_time,
  ADD COLUMN available_days VARCHAR(100) DEFAULT 'mon,tue,wed,thu,fri' AFTER available_end_time,
  ADD COLUMN advance_booking_days INT DEFAULT 3 AFTER available_days,
  ADD COLUMN restrictions TEXT AFTER advance_booking_days;

-- Update existing rooms with default values
UPDATE rooms SET 
  building = 'อาคาร 1 (อาคารเรียนรวม)',
  floor = '1',
  available_start_time = '08:00:00',
  available_end_time = '17:00:00',
  available_days = 'mon,tue,wed,thu,fri',
  advance_booking_days = 3
WHERE building IS NULL;
