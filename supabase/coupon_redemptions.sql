-- ============================================================
-- Coupon Redemptions Table
-- Enforces single-use of coupon codes per email address.
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code text          NOT NULL,
  email       text          NOT NULL,
  redeemed_at timestamptz   NOT NULL DEFAULT now(),

  -- One redemption per (coupon, email) pair
  CONSTRAINT coupon_redemptions_unique UNIQUE (coupon_code, email)
);

-- Index for fast lookups by email
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_email
  ON public.coupon_redemptions (email);

-- Index for fast lookups by coupon code
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_code
  ON public.coupon_redemptions (coupon_code);

-- ============================================================
-- Row Level Security
-- Only the service-role key (used by your backend server) can
-- read/write this table. The anon/public key has no access.
-- ============================================================

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Block all access via the anon/public key
CREATE POLICY "No public access"
  ON public.coupon_redemptions
  FOR ALL
  TO anon, authenticated
  USING (false);

-- ============================================================
-- USAGE NOTES
-- Your server.js must use the SUPABASE_SERVICE_ROLE_KEY
-- (not the anon key) to bypass RLS and insert/select rows.
-- Add to your .env:
--   SUPABASE_URL=https://your-project.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
-- ============================================================
