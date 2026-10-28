-- LUME house: events, media, spaces, reservations, staff

create table if not exists staff (
  user_id      text primary key,
  email        text not null,
  display_name text not null default '',
  role         text not null check (role in ('admin', 'supervisor', 'collaborator')),
  created_at   timestamptz not null default now()
);

create table if not exists staff_requests (
  user_id      text primary key,
  email        text not null,
  display_name text not null default '',
  created_at   timestamptz not null default now()
);

create table if not exists events (
  id           serial primary key,
  title        text not null,
  slug         text not null unique,
  description  text not null default '',
  lineup       text not null default '',
  venue        text not null default 'pista',
  event_date   date not null,
  start_time   text not null default '23:00',
  end_time     text not null default '06:00',
  cover_url    text not null default '',
  video_url    text not null default '',
  ticket_url   text not null default '',
  featured     boolean not null default false,
  published    boolean not null default true,
  created_by   text not null,
  created_at   timestamptz not null default now()
);

create index if not exists events_date_idx on events (event_date);

create table if not exists media (
  id         serial primary key,
  kind       text not null check (kind in ('photo', 'video')),
  url        text not null,
  title      text not null default '',
  event_id   integer references events(id) on delete set null,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists spaces (
  id          serial primary key,
  kind        text not null check (kind in ('mesa', 'salao')),
  code        text not null unique,
  name        text not null,
  zone        text not null default '',
  capacity    integer not null,
  min_spend   integer not null default 0,
  description text not null default '',
  available   boolean not null default true,
  sort_order  integer not null default 0
);

create table if not exists reservations (
  id           serial primary key,
  space_id     integer not null references spaces(id),
  guest_name   text not null,
  guest_email  text not null,
  guest_phone  text not null,
  party_size   integer not null,
  reserved_for date not null,
  status       text not null default 'pending'
               check (status in ('pending', 'confirmed', 'declined', 'cancelled')),
  notes        text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists reservations_date_idx on reservations (reserved_for);
create index if not exists reservations_space_idx on reservations (space_id);

create unique index if not exists reservations_active_slot
  on reservations (space_id, reserved_for)
  where status in ('pending', 'confirmed');
