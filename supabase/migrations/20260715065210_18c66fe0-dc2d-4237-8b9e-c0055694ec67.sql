
-- 1. Seed admin role for the first admin user (if the account exists)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'aungset.min11@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Admin visibility policies on user-scoped tables
CREATE POLICY "Admins view all enrollments" ON public.event_enrollments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all enrollments" ON public.event_enrollments
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete all enrollments" ON public.event_enrollments
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all payments" ON public.payment_history
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all payments" ON public.payment_history
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Official partners table
CREATE TABLE public.official_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  title TEXT,
  rating INTEGER,
  bio TEXT,
  expertise TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  contact_email TEXT,
  contact_phone TEXT,
  avatar_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.official_partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.official_partners TO authenticated;
GRANT ALL ON public.official_partners TO service_role;

ALTER TABLE public.official_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners public read" ON public.official_partners
  FOR SELECT TO public USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage partners" ON public.official_partners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_official_partners_updated_at
  BEFORE UPDATE ON public.official_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
