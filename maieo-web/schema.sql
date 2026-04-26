-- Run this in your Neon SQL Editor at console.neon.tech

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS debates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  query       TEXT NOT NULL,
  result      JSONB NOT NULL,
  share_id    TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  is_public   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-user history lookup
CREATE INDEX IF NOT EXISTS idx_debates_user_id ON debates(user_id, created_at DESC);

-- Index for share link lookups
CREATE INDEX IF NOT EXISTS idx_debates_share_id ON debates(share_id) WHERE is_public = true;
