-- =============================================================================
-- RDN Database Migration 001
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- 1. admin
-- Custom auth: username/password + security question recovery
-- Only one admin row expected in V1
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username            TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  security_question   TEXT NOT NULL,
  security_answer_hash TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Password reset token (one-time, expires 1h)
CREATE TABLE IF NOT EXISTS admin_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   UUID NOT NULL REFERENCES admin(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. portfolio_results
-- Carousel items: thumbnail + external project URL
-- =============================================================================
CREATE TABLE IF NOT EXISTS portfolio_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thumbnail_path  TEXT NOT NULL,        -- Supabase Storage path
  thumbnail_url   TEXT NOT NULL,        -- Public URL for display
  project_url     TEXT NOT NULL,        -- External link (Instagram, YouTube, etc.)
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_published
  ON portfolio_results(is_published, sort_order);

-- =============================================================================
-- 3. pricing_packages
-- Exactly 3 packages (enforced by CHECK + seed data)
-- Draft/published model: is_published controls public visibility
-- =============================================================================
CREATE TABLE IF NOT EXISTS pricing_packages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_number   SMALLINT NOT NULL CHECK (package_number BETWEEN 1 AND 3) UNIQUE,
  name             TEXT NOT NULL,
  price            INTEGER NOT NULL CHECK (price >= 0),   -- in IDR (Rupiah), integer
  description      TEXT NOT NULL DEFAULT '',
  estimated_time   TEXT NOT NULL DEFAULT '',
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  draft_name       TEXT,
  draft_price      INTEGER,
  draft_description TEXT,
  draft_estimated_time TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. site_settings
-- Single-row config: Instagram handle + URL
-- =============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id                  INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- singleton
  instagram_username  TEXT NOT NULL DEFAULT 'rdn_riifin_cam',
  instagram_url       TEXT NOT NULL DEFAULT 'https://instagram.com/rdn_riifin_cam',
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- RLS Policies
-- =============================================================================

-- portfolio_results: public can read published items only
ALTER TABLE portfolio_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published results" ON portfolio_results;
CREATE POLICY "Public read published results"
  ON portfolio_results FOR SELECT
  USING (is_published = TRUE);

-- pricing_packages: public can read published packages only
ALTER TABLE pricing_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published packages" ON pricing_packages;
CREATE POLICY "Public read published packages"
  ON pricing_packages FOR SELECT
  USING (is_published = TRUE);

-- site_settings: public can read
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read settings" ON site_settings;
CREATE POLICY "Public read settings"
  ON site_settings FOR SELECT
  USING (TRUE);

-- admin + admin_reset_tokens: no public access (service role only via server client)
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_reset_tokens ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Seed data
-- =============================================================================

-- 3 pricing packages (required, always exactly 3)
INSERT INTO pricing_packages (package_number, name, price, description, estimated_time, is_published)
VALUES
  (1, 'Edit Only',        30000, 'Editing video dari footage yang sudah ada. Cut, color, subtitle.', '1-2 hari', TRUE),
  (2, 'Shoot + Edit',     70000, 'Pengambilan gambar dan editing lengkap untuk tugas sekolah.', '2-3 hari', TRUE),
  (3, 'Full Production', 100000, 'Shooting, editing, motion graphics, dan sound design.', '3-5 hari', TRUE)
ON CONFLICT (package_number) DO NOTHING;

-- Default site settings
INSERT INTO site_settings (id, instagram_username, instagram_url)
VALUES (1, 'rdn_riifin_cam', 'https://instagram.com/rdn_riifin_cam')
ON CONFLICT (id) DO NOTHING;
