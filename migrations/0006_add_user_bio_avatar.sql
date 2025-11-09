-- Migration number: 0006 	 2025-11-10T00:00:00.000Z

-- Add bio and avatar_url columns to users table
ALTER TABLE users ADD bio TEXT;
ALTER TABLE users ADD avatar_url TEXT;
