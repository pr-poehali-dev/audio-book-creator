CREATE TABLE IF NOT EXISTS t_p29363705_audio_book_creator.creative_projects (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    module text NOT NULL,
    title text NOT NULL DEFAULT 'Без названия',
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    preview text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creative_projects_user
    ON t_p29363705_audio_book_creator.creative_projects (user_id, module, updated_at DESC);