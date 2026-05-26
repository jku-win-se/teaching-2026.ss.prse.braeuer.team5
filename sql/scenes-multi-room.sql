-- Migration: scenes 1:n rooms via scene_rooms junction table
-- Führe dieses Script im Supabase SQL Editor aus

-- 1. Junction-Tabelle erstellen
CREATE TABLE IF NOT EXISTS scene_rooms (
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  room_id  UUID NOT NULL REFERENCES rooms(id)  ON DELETE CASCADE,
  PRIMARY KEY (scene_id, room_id)
);

-- 2. Bestehende Zuordnungen übertragen
INSERT INTO scene_rooms (scene_id, room_id)
SELECT id, room_id FROM scenes WHERE room_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. room_id auf scenes nullable machen (Backwards-Compat)
ALTER TABLE scenes ALTER COLUMN room_id DROP NOT NULL;

-- 4. RLS aktivieren
ALTER TABLE scene_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can view scene_rooms"
ON scene_rooms FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated users can insert scene_rooms"
ON scene_rooms FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated users can delete scene_rooms"
ON scene_rooms FOR DELETE TO authenticated USING (true);
