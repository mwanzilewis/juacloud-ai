CREATE TABLE public.chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  question text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.chat_history TO anon, authenticated;
GRANT ALL ON public.chat_history TO service_role;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read history" ON public.chat_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can add history" ON public.chat_history FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(question) BETWEEN 1 AND 1000 AND char_length(device_id) BETWEEN 8 AND 64);
CREATE POLICY "anyone can delete history" ON public.chat_history FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX chat_history_device_idx ON public.chat_history (device_id, created_at DESC);