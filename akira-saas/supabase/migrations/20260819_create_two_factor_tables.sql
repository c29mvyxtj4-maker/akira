-- Create two_factor_setup table
CREATE TABLE IF NOT EXISTS public.two_factor_setup (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  secret text NOT NULL,
  backup_codes text[] NOT NULL DEFAULT ARRAY[]::text[],
  verified boolean DEFAULT false,
  enabled_at timestamp with time zone,
  disabled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create two_factor_used_codes table (to prevent backup code reuse)
CREATE TABLE IF NOT EXISTS public.two_factor_used_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  used_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_two_factor_setup_user_id ON public.two_factor_setup(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_setup_verified ON public.two_factor_setup(verified);
CREATE INDEX IF NOT EXISTS idx_two_factor_used_codes_user_id ON public.two_factor_used_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_used_codes_code ON public.two_factor_used_codes(code);

-- Enable RLS
ALTER TABLE public.two_factor_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_used_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own 2FA setup
CREATE POLICY "Users can view own 2fa"
  ON public.two_factor_setup
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own 2FA setup
CREATE POLICY "Users can update own 2fa"
  ON public.two_factor_setup
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can insert their own 2FA setup
CREATE POLICY "Users can create 2fa"
  ON public.two_factor_setup
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view used backup codes
CREATE POLICY "Users can view own used codes"
  ON public.two_factor_used_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert used codes
CREATE POLICY "Users can log used codes"
  ON public.two_factor_used_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.two_factor_setup;
