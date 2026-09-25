-- =============================================================================
-- Migration: 002_software_skills.sql
-- Table for software skill logos displayed in macOS Dock style carousel
-- =============================================================================

CREATE TABLE IF NOT EXISTS software_skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  svg_content TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Public can read
ALTER TABLE software_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read software skills" ON software_skills;
CREATE POLICY "Public read software skills"
  ON software_skills FOR SELECT
  USING (TRUE);
