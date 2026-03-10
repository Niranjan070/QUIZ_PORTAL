-- Migration: Add max_percentage_required column to quizzes table
ALTER TABLE quizzes ADD COLUMN max_percentage_required INT DEFAULT 100 AFTER min_percentage_required;
UPDATE quizzes SET max_percentage_required = 100 WHERE max_percentage_required IS NULL;
