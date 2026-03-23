-- Harper Premium — Supabase Schema
-- Run this in the Supabase SQL editor

-- Girls profiles
create table if not exists girls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int,
  store text check (store in ('도파민', '엘리트', '퍼펙트')),
  photo_url text,
  intro text,
  stats jsonb,  -- { height, weight, bust, specialty }
  created_at timestamptz default now()
);

-- Work schedule
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  girl_id uuid references girls(id) on delete cascade,
  work_date date not null,
  is_available boolean default true,
  unique(girl_id, work_date)
);

-- Indexes
create index if not exists idx_schedules_work_date on schedules(work_date);
create index if not exists idx_schedules_girl_id on schedules(girl_id);
create index if not exists idx_girls_store on girls(store);

-- Row-level security (optional — enable if using auth)
-- alter table girls enable row level security;
-- alter table schedules enable row level security;

-- Sample data (optional)
/*
insert into girls (name, age, store, intro, stats) values
  ('수아', 23, '도파민', '안녕하세요 수아입니다 ✨', '{"height":163,"weight":48,"bust":"C","specialty":"수면"}'),
  ('지원', 24, '도파민', '편안하고 즐거운 시간을 드리겠습니다', '{"height":160,"weight":50,"bust":"B","specialty":"아로마"}'),
  ('서연', 22, '엘리트', '최고의 서비스로 모시겠습니다', '{"height":165,"weight":47,"bust":"D","specialty":"타이"}'),
  ('지유', 25, '퍼펙트', '완벽한 힐링을 경험하세요', '{"height":162,"weight":49,"bust":"C","specialty":"스웨디시"}');
*/
