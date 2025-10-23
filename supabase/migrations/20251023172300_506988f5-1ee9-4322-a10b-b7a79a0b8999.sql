-- Add display_name and anonymous_compensation_id to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS anonymous_compensation_id UUID DEFAULT gen_random_uuid(),
ADD CONSTRAINT unique_display_name UNIQUE (display_name);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_anonymous_compensation_id 
ON public.profiles(anonymous_compensation_id);

-- Update existing profiles to have anonymous IDs if they don't have one
UPDATE public.profiles 
SET anonymous_compensation_id = gen_random_uuid() 
WHERE anonymous_compensation_id IS NULL;

-- Create function to get anonymous ID from user ID
CREATE OR REPLACE FUNCTION public.get_anonymous_id_for_user(user_uuid UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT anonymous_compensation_id 
  FROM public.profiles 
  WHERE user_id = user_uuid;
$$;

COMMENT ON COLUMN public.profiles.display_name IS 'User chosen display name - must be unique';
COMMENT ON COLUMN public.profiles.anonymous_compensation_id IS 'Anonymous identifier used for compensation data - cannot be linked to email without database access';
COMMENT ON FUNCTION public.get_anonymous_id_for_user IS 'Securely retrieves anonymous compensation ID for a user';