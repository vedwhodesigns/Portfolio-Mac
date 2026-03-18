-- ─────────────────────────────────────────────────────────
-- Portfolio CMS Schema
-- Run this entire file in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Folders ───────────────────────────────────────────────
CREATE TABLE folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  parent_id   UUID REFERENCES folders(id) ON DELETE SET NULL,
  icon_url    TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default folders
INSERT INTO folders (id, name, parent_id, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Movies',     NULL, 1),
  ('00000000-0000-0000-0000-000000000002', 'Pictures',   NULL, 2),
  ('00000000-0000-0000-0000-000000000003', 'Documents',  NULL, 3),
  ('00000000-0000-0000-0000-000000000004', 'VFX',        '00000000-0000-0000-0000-000000000001', 1),
  ('00000000-0000-0000-0000-000000000005', 'Motion',     '00000000-0000-0000-0000-000000000001', 2),
  ('00000000-0000-0000-0000-000000000006', 'CGI',        '00000000-0000-0000-0000-000000000002', 1),
  ('00000000-0000-0000-0000-000000000007', 'Concept Art','00000000-0000-0000-0000-000000000002', 2);

-- ── Tags ──────────────────────────────────────────────────
CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  color      TEXT DEFAULT '#888888',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed app/software tags
INSERT INTO tags (name, color) VALUES
  ('After Effects',  '#9999FF'),
  ('Premiere Pro',   '#9999FF'),
  ('Photoshop',      '#31A8FF'),
  ('Illustrator',    '#FF9A00'),
  ('Cinema 4D',      '#1C6FFF'),
  ('Blender',        '#E87D0D'),
  ('Maya',           '#00AA88'),
  ('Houdini',        '#FF6D00'),
  ('ZBrush',         '#CC2200'),
  ('Figma',          '#A259FF'),
  ('Unreal Engine',  '#1BAEFF'),
  ('Favorite',       '#FF3B30'),
  ('VFX',            '#5856D6'),
  ('Motion Design',  '#FF9500'),
  ('CGI',            '#34C759'),
  ('Concept Art',    '#FF2D55'),
  ('Reel',           '#007AFF'),
  ('UI/UX',          '#AF52DE'),
  ('Architecture',   '#8E8E93');

-- ── Files ─────────────────────────────────────────────────
CREATE TABLE files (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('Image','Video','PDF','Application','Folder')),
  file_url       TEXT NOT NULL DEFAULT '',
  thumbnail_url  TEXT,
  icon_url       TEXT,
  folder_id      UUID REFERENCES folders(id) ON DELETE SET NULL,
  size           TEXT,
  date_modified  TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── File ↔ Tag junction ───────────────────────────────────
CREATE TABLE file_tags (
  file_id  UUID REFERENCES files(id) ON DELETE CASCADE,
  tag_id   UUID REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (file_id, tag_id)
);

-- ── Tracks ────────────────────────────────────────────────
CREATE TABLE tracks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  artist     TEXT NOT NULL,
  duration   INTEGER DEFAULT 0,
  url        TEXT NOT NULL DEFAULT '',
  album_art  TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed sample tracks
INSERT INTO tracks (title, artist, duration, url, sort_order) VALUES
  ('Midnight Drive',  'Ambient Studio',    214, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 1),
  ('Pixel Dreams',    'Synth Collective',  187, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 2),
  ('Chromatic',       'Lo-Fi Sessions',    243, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 3);

-- ── Storage bucket ────────────────────────────────────────
-- Run this separately in Supabase Dashboard → Storage → New Bucket
-- Bucket name: portfolio-media
-- Public: true

-- ── Row Level Security ────────────────────────────────────
-- Public read on everything
ALTER TABLE folders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE files    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags     ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read folders"   ON folders   FOR SELECT USING (true);
CREATE POLICY "Public read files"     ON files     FOR SELECT USING (true);
CREATE POLICY "Public read tags"      ON tags      FOR SELECT USING (true);
CREATE POLICY "Public read file_tags" ON file_tags FOR SELECT USING (true);
CREATE POLICY "Public read tracks"    ON tracks    FOR SELECT USING (true);

-- Admin write (service role bypasses RLS, so these are for anon admin panel)
-- In production, add proper auth check: auth.role() = 'authenticated'
CREATE POLICY "Service write folders"    ON folders   FOR ALL USING (true);
CREATE POLICY "Service write files"      ON files     FOR ALL USING (true);
CREATE POLICY "Service write tags"       ON tags      FOR ALL USING (true);
CREATE POLICY "Service write file_tags"  ON file_tags FOR ALL USING (true);
CREATE POLICY "Service write tracks"     ON tracks    FOR ALL USING (true);

-- ── Helper view: files with tags ──────────────────────────
CREATE VIEW files_with_tags AS
SELECT
  f.*,
  COALESCE(
    json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
    FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) AS tags
FROM files f
LEFT JOIN file_tags ft ON ft.file_id = f.id
LEFT JOIN tags t       ON t.id = ft.tag_id
GROUP BY f.id;
