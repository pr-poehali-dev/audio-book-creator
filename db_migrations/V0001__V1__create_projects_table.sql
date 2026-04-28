
CREATE TABLE IF NOT EXISTS t_p29363705_audio_book_creator.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  text_content TEXT NOT NULL,
  voice_id TEXT NOT NULL DEFAULT 'alena',
  speed NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'pending',
  audio_url TEXT,
  duration_sec INTEGER,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON t_p29363705_audio_book_creator.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON t_p29363705_audio_book_creator.projects(status);
