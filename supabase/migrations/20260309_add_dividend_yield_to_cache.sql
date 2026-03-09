-- Add dividend_yield column to stock_cache for Yahoo Finance data
ALTER TABLE stock_cache ADD COLUMN IF NOT EXISTS dividend_yield numeric(8,4);
