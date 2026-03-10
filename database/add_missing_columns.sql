-- Add missing columns to users table if they don't exist
-- Run this script to ensure all required columns are present

USE online_quiz_portal;

-- Add 'year' column if it doesn't exist
-- This stores the year of study (e.g., 'I Year', 'II Year', 'III Year')
ALTER TABLE users ADD COLUMN IF NOT EXISTS year VARCHAR(20) DEFAULT NULL;

-- Add 'stream' column if it doesn't exist (maps to funding_type in some code paths)
ALTER TABLE users ADD COLUMN IF NOT EXISTS stream VARCHAR(50) DEFAULT NULL;

-- Add 'designation' column if it doesn't exist (for faculty)
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(100) DEFAULT NULL;

-- Add 'department_name' column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_name VARCHAR(255) DEFAULT NULL;

-- Sync department → department_name if department_name is null but department exists
UPDATE users SET department_name = department WHERE department_name IS NULL AND department IS NOT NULL;

-- Sync funding_type → stream if stream is null but funding_type exists
UPDATE users SET stream = funding_type WHERE stream IS NULL AND funding_type IS NOT NULL;
