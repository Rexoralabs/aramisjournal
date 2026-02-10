
CREATE TABLE public.cellar_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  color TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cellar_thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own thoughts"
ON public.cellar_thoughts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own thoughts"
ON public.cellar_thoughts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thoughts"
ON public.cellar_thoughts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own thoughts"
ON public.cellar_thoughts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_cellar_thoughts_updated_at
BEFORE UPDATE ON public.cellar_thoughts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
