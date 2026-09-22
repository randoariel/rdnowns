-- Run this migration in Supabase SQL Editor to add title and is_pinned columns

ALTER TABLE portfolio_results 
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';

ALTER TABLE portfolio_results 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT TRUE;
