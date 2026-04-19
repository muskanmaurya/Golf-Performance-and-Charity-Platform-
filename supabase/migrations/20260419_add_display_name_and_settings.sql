-- Migration: Add display_name to profiles table

-- Description:
-- Adds optional display_name field to the profiles table for the settings page
-- This allows users to have a different display name from their full name

-- Add the display_name column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_name text;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.display_name IS 'Optional custom display name for the user profile';

-- Note: If you need to create a notification_preferences column for storing notification settings:
-- ALTER TABLE public.profiles
-- ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"draw_emails": true, "weekly_reports": true}';
