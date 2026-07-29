-- Migration: Add file/image support to messages table
-- Run this in your Supabase SQL Editor

-- 1. Add columns for file attachments to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

-- 2. Add columns for coordinates to gigs table (if not already added)
ALTER TABLE gigs 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 3. Create storage bucket for chat attachments (if not exists)
-- Note: This needs to be done in Supabase Dashboard > Storage
-- Bucket name: chat-attachments
-- Public: false (only authenticated users)
-- File size limit: 10MB
-- Allowed MIME types: image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.*

-- 4. Set up RLS policies for storage bucket
-- Run these in Supabase Dashboard > Storage > chat-attachments > Policies

-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Policy 2: Allow users to view attachments in their conversations
CREATE POLICY "Users can view their chat attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments');

-- Policy 3: Allow users to delete their own attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_attachment ON messages(attachment_url) WHERE attachment_url IS NOT NULL;

-- 6. Add comment for documentation
COMMENT ON COLUMN messages.attachment_url IS 'URL to file stored in Supabase Storage';
COMMENT ON COLUMN messages.attachment_type IS 'MIME type of attachment (e.g., image/jpeg, application/pdf)';
COMMENT ON COLUMN messages.attachment_name IS 'Original filename of attachment';
COMMENT ON COLUMN messages.attachment_size IS 'File size in bytes';

-- Verification queries:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages';
-- SELECT * FROM messages WHERE attachment_url IS NOT NULL LIMIT 5;

-- ============================================================
-- Migration: OTP Store table for server-side OTP persistence
-- Required for OTPs to survive Railway server restarts/deploys.
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- 7. Create otp_store table
CREATE TABLE IF NOT EXISTS otp_store (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (service role key used by server bypasses it automatically)
ALTER TABLE otp_store ENABLE ROW LEVEL SECURITY;

-- Auto-delete expired OTPs to keep the table clean
-- (Supabase does not have native TTL — use a cron or pg_cron for this)
-- Alternatively, the server deletes OTPs on verify/expiry check.

-- Index for fast lookups by email
CREATE INDEX IF NOT EXISTS idx_otp_store_email ON otp_store(email);

-- Index to help with cleanup of expired records
CREATE INDEX IF NOT EXISTS idx_otp_store_expires ON otp_store(expires_at);

-- Verification:
-- SELECT * FROM otp_store;
