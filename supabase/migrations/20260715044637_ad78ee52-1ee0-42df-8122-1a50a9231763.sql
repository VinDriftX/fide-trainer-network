
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, fide_id, phone, address)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'fide_id',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.event_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  event_name text NOT NULL,
  nrc text NOT NULL,
  payment_method text NOT NULL,
  screenshot_url text,
  rating_standard int,
  rating_rapid int,
  rating_blitz int,
  rating_bullet int,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_enrollments TO authenticated;
GRANT ALL ON public.event_enrollments TO service_role;
ALTER TABLE public.event_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own enrollments" ON public.event_enrollments;
DROP POLICY IF EXISTS "Users insert own enrollments" ON public.event_enrollments;
DROP POLICY IF EXISTS "Users update own enrollments" ON public.event_enrollments;
DROP POLICY IF EXISTS "Users delete own enrollments" ON public.event_enrollments;
CREATE POLICY "Users view own enrollments" ON public.event_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own enrollments" ON public.event_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own enrollments" ON public.event_enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own enrollments" ON public.event_enrollments FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_event_enrollments_updated_at ON public.event_enrollments;
CREATE TRIGGER update_event_enrollments_updated_at
BEFORE UPDATE ON public.event_enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  payment_method text NOT NULL,
  reference_id text,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_history TO authenticated;
GRANT ALL ON public.payment_history TO service_role;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own payments" ON public.payment_history;
DROP POLICY IF EXISTS "Users insert own payments" ON public.payment_history;
DROP POLICY IF EXISTS "Users update own payments" ON public.payment_history;
DROP POLICY IF EXISTS "Users delete own payments" ON public.payment_history;
CREATE POLICY "Users view own payments" ON public.payment_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own payments" ON public.payment_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own payments" ON public.payment_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own payments" ON public.payment_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_payment_history_updated_at ON public.payment_history;
CREATE TRIGGER update_payment_history_updated_at
BEFORE UPDATE ON public.payment_history
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_payment_history_user_created ON public.payment_history(user_id, created_at DESC);

DROP POLICY IF EXISTS "Users upload own payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users view own payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users update own payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own payment screenshots" ON storage.objects;
CREATE POLICY "Users upload own payment screenshots" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users view own payment screenshots" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own payment screenshots" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own payment screenshots" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
