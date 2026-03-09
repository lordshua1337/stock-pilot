-- StockPilot V3 Database Schema
-- Extensions
create extension if not exists "pg_cron" with schema extensions;

-- ============================================
-- USERS & AUTH
-- ============================================
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table user_profiles enable row level security;
create policy "Users can read own profile" on user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on user_profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- USER PREFERENCES
-- ============================================
create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text default 'dark' check (theme in ('light', 'dark')),
  notifications_enabled boolean default true,
  portfolio_visibility text default 'private' check (portfolio_visibility in ('private', 'public')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table user_preferences enable row level security;
create policy "Users can manage own preferences" on user_preferences for all using (auth.uid() = user_id);

-- ============================================
-- PERSONALITY / FINANCIAL DNA RESULTS
-- ============================================
create table if not exists personality_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  archetype text not null,
  archetype_label text not null,
  factor_scores jsonb not null default '{}',
  risk_tolerance numeric(3,2) not null default 0.50,
  quiz_answers jsonb not null default '[]',
  created_at timestamptz default now() not null
);

alter table personality_results enable row level security;
create policy "Users can manage own personality" on personality_results for all using (auth.uid() = user_id);
create index idx_personality_user on personality_results(user_id);

-- ============================================
-- PORTFOLIOS & HOLDINGS
-- ============================================
create table if not exists portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_name text not null default 'My Portfolio',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table portfolios enable row level security;
create policy "Users can manage own portfolios" on portfolios for all using (auth.uid() = user_id);
create index idx_portfolios_user on portfolios(user_id);

create table if not exists holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  shares numeric(12,4) not null default 0,
  purchase_price numeric(12,4) not null default 0,
  purchase_date date,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table holdings enable row level security;
create policy "Users can manage own holdings" on holdings for all using (auth.uid() = user_id);
create index idx_holdings_portfolio on holdings(portfolio_id);
create index idx_holdings_ticker on holdings(ticker);

-- ============================================
-- PORTFOLIO SNAPSHOTS (daily P&L tracking)
-- ============================================
create table if not exists portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_date date not null default current_date,
  total_value numeric(14,2) not null default 0,
  total_cost numeric(14,2) not null default 0,
  daily_change numeric(14,2) default 0,
  holdings_snapshot jsonb not null default '[]',
  created_at timestamptz default now() not null,
  unique(portfolio_id, snapshot_date)
);

alter table portfolio_snapshots enable row level security;
create policy "Users can manage own snapshots" on portfolio_snapshots for all using (auth.uid() = user_id);
create index idx_snapshots_portfolio_date on portfolio_snapshots(portfolio_id, snapshot_date);

-- ============================================
-- WATCHLISTS
-- ============================================
create table if not exists watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  watchlist_name text not null default 'My Watchlist',
  tickers text[] not null default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table watchlists enable row level security;
create policy "Users can manage own watchlists" on watchlists for all using (auth.uid() = user_id);
create index idx_watchlists_user on watchlists(user_id);

-- ============================================
-- STOCK CACHE (live market data)
-- ============================================
create table if not exists stock_cache (
  ticker text primary key,
  price numeric(12,4) not null,
  change_amount numeric(12,4) default 0,
  change_percent numeric(8,4) default 0,
  volume bigint default 0,
  market_cap numeric(16,2),
  pe_ratio numeric(8,2),
  week_52_high numeric(12,4),
  week_52_low numeric(12,4),
  dividend_yield numeric(8,4),
  raw_data jsonb default '{}',
  last_refreshed timestamptz default now() not null
);

-- No RLS on stock_cache -- public read, server-only write
alter table stock_cache enable row level security;
create policy "Anyone can read stock cache" on stock_cache for select using (true);

-- ============================================
-- AI ANALYSES (Claude thesis cache)
-- ============================================
create table if not exists ai_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  analysis_type text not null default 'thesis',
  result jsonb not null default '{}',
  archetype_context text,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '7 days') not null
);

alter table ai_analyses enable row level security;
create policy "Users can manage own analyses" on ai_analyses for all using (auth.uid() = user_id);
create index idx_analyses_user_ticker on ai_analyses(user_id, ticker);
create index idx_analyses_expires on ai_analyses(expires_at);

-- ============================================
-- FLIGHT PLANS (daily personalized recs)
-- ============================================
create table if not exists flight_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null default current_date,
  items jsonb not null default '[]',
  archetype text,
  portfolio_context jsonb default '{}',
  created_at timestamptz default now() not null,
  unique(user_id, plan_date)
);

alter table flight_plans enable row level security;
create policy "Users can manage own flight plans" on flight_plans for all using (auth.uid() = user_id);
create index idx_flight_plans_user_date on flight_plans(user_id, plan_date);

-- ============================================
-- ERROR LOGS (API error persistence)
-- ============================================
create table if not exists error_logs (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  message text not null,
  stack text,
  metadata jsonb default '{}',
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null
);

-- No RLS -- server-only writes, admin reads
alter table error_logs enable row level security;
create policy "Service role can manage error logs" on error_logs for all using (true);
create index idx_error_logs_route on error_logs(route);
create index idx_error_logs_created on error_logs(created_at);

-- ============================================
-- AI CHAT USAGE (copilot rate limiting)
-- ============================================
create table if not exists ai_chat_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null
);

alter table ai_chat_usage enable row level security;
create policy "Users can view own chat usage" on ai_chat_usage for select using (auth.uid() = user_id);
create policy "Service role can manage chat usage" on ai_chat_usage for insert using (true);
create index idx_chat_usage_user_date on ai_chat_usage(user_id, created_at);
