
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only admins can view user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add phone to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add attendant photo to funnels
ALTER TABLE public.funnels ADD COLUMN IF NOT EXISTS attendant_photo_url TEXT;

-- Create presence table for real-time online tracking
CREATE TABLE public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_online BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Users can manage their own presence
CREATE POLICY "Users can upsert own presence"
ON public.user_presence
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all presence
CREATE POLICY "Admins can view all presence"
ON public.user_presence
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Admin function to get all users (security definer to access auth.users)
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS TABLE(
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  funnel_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    p.display_name,
    p.phone,
    p.avatar_url,
    COALESCE(fc.cnt, 0) AS funnel_count
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS cnt FROM public.funnels GROUP BY user_id
  ) fc ON fc.user_id = u.id
  ORDER BY u.created_at DESC
$$;

-- Admin function to get user funnels
CREATE OR REPLACE FUNCTION public.admin_get_user_funnels(_user_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  block_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    f.id,
    f.name,
    f.slug,
    f.status,
    f.created_at,
    COALESCE(bc.cnt, 0) AS block_count
  FROM public.funnels f
  LEFT JOIN (
    SELECT funnel_id, COUNT(*) AS cnt FROM public.funnel_blocks GROUP BY funnel_id
  ) bc ON bc.funnel_id = f.id
  WHERE f.user_id = _user_id
  ORDER BY f.created_at DESC
$$;
