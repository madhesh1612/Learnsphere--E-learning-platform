-- Add user blocking functionality to profiles table

-- Add blocking columns to profiles
ALTER TABLE public.profiles
ADD COLUMN is_blocked BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN blocked_at TIMESTAMPTZ,
ADD COLUMN blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster blocked user lookups
CREATE INDEX idx_profiles_is_blocked ON public.profiles(is_blocked);

-- Function to check if current user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.profiles WHERE id = auth.uid()),
    false
  )
$$;

-- Update RLS policies to prevent blocked users from accessing content
-- This will be checked in the application layer as well for better UX

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_blocked IS 'Whether the user account is blocked by an admin';
COMMENT ON COLUMN public.profiles.blocked_at IS 'Timestamp when the user was blocked';
COMMENT ON COLUMN public.profiles.blocked_by IS 'Admin user ID who blocked this user';
