-- Add member_code to members table for membership verification
ALTER TABLE members ADD COLUMN member_code TEXT;

-- Add restricted flag to download_files
ALTER TABLE download_files ADD COLUMN restricted INTEGER DEFAULT 0;
