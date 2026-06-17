ALTER TABLE t_p29363705_audio_book_creator.creative_projects
  ADD COLUMN IF NOT EXISTS is_example BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE t_p29363705_audio_book_creator.projects
  ADD COLUMN IF NOT EXISTS is_example BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_creative_projects_example
  ON t_p29363705_audio_book_creator.creative_projects(is_example);
