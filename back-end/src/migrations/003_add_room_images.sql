-- Migration: Add sample room images from Unsplash
-- Run this script after rooms have been created
-- This will add 4 unique images per room with variety

-- Delete existing images first (to avoid duplicates)
DELETE FROM room_images;

-- Use row number to create variety
SET @row_num = 0;

-- Insert 4 images per room with different main images
INSERT INTO room_images (room_id, image_path, image_url)
SELECT room_id, 'external', image_url FROM (
  SELECT r.room_id, 
    ELT((@row_num := @row_num + 1) % 10 + 1,
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80',
      'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80',
      'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80'
    ) as image_url
  FROM rooms r ORDER BY r.room_id
) t;

SET @row_num = 3;
INSERT INTO room_images (room_id, image_path, image_url)
SELECT room_id, 'external', image_url FROM (
  SELECT r.room_id, 
    ELT((@row_num := @row_num + 1) % 10 + 1,
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
      'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80',
      'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80'
    ) as image_url
  FROM rooms r ORDER BY r.room_id
) t;

SET @row_num = 6;
INSERT INTO room_images (room_id, image_path, image_url)
SELECT room_id, 'external', image_url FROM (
  SELECT r.room_id, 
    ELT((@row_num := @row_num + 1) % 10 + 1,
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80',
      'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80',
      'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80',
      'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80'
    ) as image_url
  FROM rooms r ORDER BY r.room_id
) t;

SET @row_num = 9;
INSERT INTO room_images (room_id, image_path, image_url)
SELECT room_id, 'external', image_url FROM (
  SELECT r.room_id, 
    ELT((@row_num := @row_num + 1) % 10 + 1,
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
      'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80'
    ) as image_url
  FROM rooms r ORDER BY r.room_id
) t;
