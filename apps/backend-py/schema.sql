-- Staffless AI — database schema for the FastAPI (apps/backend-py) backend.
--
-- HOW TO APPLY (Supabase):
--   1. Open your Supabase project → SQL Editor → New query.
--   2. Paste this whole file and click "Run".
--   3. Use the DIRECT connection string (port 5432) for this, then the
--      transaction pooler string (port 6543) for the running app.
--
-- Design notes:
--   * Table names are lowercase; column names are quoted camelCase so that
--     the API responses (built from raw rows) match the camelCase keys the
--     frontend reads (customerName, createdAt, serviceNeeded, ...).
--   * IDs are text with a generated UUID default, matching the Prisma
--     String @default(uuid()) models in apps/backend-api/prisma/schema.prisma.

create extension if not exists pgcrypto;

create table if not exists business (
    id            text primary key default gen_random_uuid()::text,
    name          text not null,
    industry      text,
    email         text,
    phone         text,
    "servicesJson" jsonb default '{}'::jsonb,
    "hoursJson"    jsonb default '{}'::jsonb,
    "faqsJson"     jsonb default '{}'::jsonb,
    "createdAt"    timestamptz not null default now()
);

create table if not exists "user" (
    id             text primary key default gen_random_uuid()::text,
    "businessId"   text unique references business(id),
    email          text unique not null,
    "passwordHash" text not null,
    name           text,
    "createdAt"    timestamptz not null default now()
);

create table if not exists customer (
    id           text primary key default gen_random_uuid()::text,
    "businessId" text not null references business(id),
    name         text,
    email        text,
    phone        text,
    channel      text not null default 'web',
    "createdAt"  timestamptz not null default now()
);

create table if not exists conversation (
    id           text primary key default gen_random_uuid()::text,
    "businessId" text not null references business(id),
    "customerId" text not null references customer(id),
    channel      text not null default 'web',
    status       text not null default 'open',
    "createdAt"  timestamptz not null default now()
);

create table if not exists message (
    id               text primary key default gen_random_uuid()::text,
    "conversationId" text not null references conversation(id),
    sender           text not null,          -- customer | ai | owner
    content          text not null,
    "agentType"      text,                   -- sales | operations | finance | marketing
    "createdAt"      timestamptz not null default now()
);

create table if not exists lead (
    id              text primary key default gen_random_uuid()::text,
    "businessId"    text not null references business(id),
    "customerId"    text not null references customer(id),
    score           integer not null default 0,
    status          text not null default 'new',  -- new | qualified | hot | converted | lost
    "serviceNeeded" text,
    budget          text,
    timeline        text,
    notes           text,
    "createdAt"     timestamptz not null default now()
);

create table if not exists appointment (
    id           text primary key default gen_random_uuid()::text,
    "businessId" text not null references business(id),
    "customerId" text not null references customer(id),
    service      text not null,
    datetime     timestamptz,
    status       text not null default 'pending', -- pending | confirmed | completed | cancelled
    "createdAt"  timestamptz not null default now()
);

create table if not exists invoice (
    id              text primary key default gen_random_uuid()::text,
    "businessId"    text not null references business(id),
    "customerId"    text not null references customer(id),
    "appointmentId" text references appointment(id),
    amount          double precision not null default 0,
    "itemsJson"     jsonb default '{}'::jsonb,
    status          text not null default 'draft',  -- draft | sent | paid | overdue
    "dueDate"       timestamptz,
    "createdAt"     timestamptz not null default now()
);

-- Note: the FastAPI backend writes to this table with an unquoted lowercase
-- name, so it is created lowercase here (unlike Prisma's "AIAction").
create table if not exists aiaction (
    id               text primary key default gen_random_uuid()::text,
    "businessId"     text not null references business(id),
    "conversationId" text references conversation(id),
    "agentType"      text,
    action           text,
    result           jsonb default '{}'::jsonb,
    "createdAt"      timestamptz not null default now()
);

-- Helpful indexes for the dashboard queries.
create index if not exists idx_conversation_business on conversation("businessId");
create index if not exists idx_lead_business on lead("businessId");
create index if not exists idx_message_conversation on message("conversationId");
create index if not exists idx_appointment_business on appointment("businessId");

-- ---------------------------------------------------------------------------
-- Demo seed so the dashboard works immediately with
-- NEXT_PUBLIC_BUSINESS_ID=demo-business (see apps/frontend-*/.env.example).
-- ---------------------------------------------------------------------------
insert into business (id, name, industry, email, phone)
values ('demo-business', 'Demo Salon', 'beauty', 'demo@salon.com', '555-0100')
on conflict (id) do nothing;
