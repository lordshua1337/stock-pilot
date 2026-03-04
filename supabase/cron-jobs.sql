-- StockPilot pg_cron Jobs
-- Run this after schema.sql to set up automated tasks.
-- Requires the pg_cron extension (already enabled in schema.sql).

-- ============================================
-- 1. Daily Portfolio Snapshots (midnight UTC)
-- ============================================
-- Calls the /api/cron/snapshots endpoint to capture daily portfolio values.
-- The API route handles the actual snapshot logic; pg_cron just triggers it.
select cron.schedule(
  'daily-portfolio-snapshots',
  '0 0 * * *', -- every day at midnight UTC
  $$
  select net.http_post(
    url := current_setting('app.settings.base_url') || '/api/cron/snapshots',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================
-- 2. Cleanup Stale AI Analyses (weekly, Sunday 3am UTC)
-- ============================================
-- Removes expired AI analyses to keep the table lean.
select cron.schedule(
  'cleanup-stale-analyses',
  '0 3 * * 0', -- every Sunday at 3am UTC
  $$
  delete from ai_analyses where expires_at < now();
  $$
);

-- ============================================
-- 3. Cleanup Old Flight Plans (monthly, 1st at 4am UTC)
-- ============================================
-- Removes flight plans older than 90 days.
select cron.schedule(
  'cleanup-old-flight-plans',
  '0 4 1 * *', -- 1st of every month at 4am UTC
  $$
  delete from flight_plans where plan_date < current_date - interval '90 days';
  $$
);
