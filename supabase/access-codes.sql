create extension if not exists pgcrypto;

create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text unique not null check (code_hash ~ '^[0-9a-f]{64}$'),
  status text not null default 'unused' check (status in ('unused', 'used', 'disabled')),
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  session_hash text check (session_hash is null or session_hash ~ '^[0-9a-f]{64}$'),
  last_verified_at timestamptz,
  note text
);

create unique index if not exists access_codes_session_hash_key
  on public.access_codes (session_hash)
  where session_hash is not null;

alter table public.access_codes enable row level security;
revoke all on table public.access_codes from anon, authenticated;
grant all on table public.access_codes to service_role;

comment on table public.access_codes is '大秦测试一次性兑换码；只保存哈希，不保存明文。';
