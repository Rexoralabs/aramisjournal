
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS ai_category TEXT;
