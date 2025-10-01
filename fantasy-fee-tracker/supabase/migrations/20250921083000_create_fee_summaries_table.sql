-- Migration: Create fee_summaries table for aggregated roster-level balances
-- This table replaces the legacy fee_summary table that never existed in production
-- and tracks per-roster fee breakdowns with running totals and metadata.

create table if not exists public.fee_summaries (
  id bigserial primary key,
  league_id text not null,
  roster_id integer not null,
  owner_name text,
  loss_fees numeric(10, 2) not null default 0,
  transaction_fees numeric(10, 2) not null default 0,
  inactive_fees numeric(10, 2) not null default 0,
  high_score_credits numeric(10, 2) not null default 0,
  other_fees numeric(10, 2) not null default 0,
  total_owed numeric(10, 2) not null default 0,
  total_paid numeric(10, 2) not null default 0,
  balance numeric(10, 2) not null default 0,
  free_transactions_remaining integer not null default 10,
  total_transactions integer not null default 0,
  paid_transactions integer not null default 0,
  mulligan_used boolean not null default false,
  updated_week integer,
  created_at timestamptz not null default now(),
  last_updated timestamptz not null default now(),
  constraint fee_summaries_league_roster_unique unique (league_id, roster_id)
);

create index if not exists fee_summaries_league_idx on public.fee_summaries (league_id);
create index if not exists fee_summaries_roster_idx on public.fee_summaries (league_id, roster_id);
