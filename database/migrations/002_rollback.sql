-- =====================================================
-- Rollback script for 002_auth_system_upgrade.sql
-- Use this ONLY if you need to undo the migration
-- =====================================================

-- Drop policies
DROP POLICY IF EXISTS "Users can view own verification status" ON public.users;
DROP POLICY IF EXISTS "Users can update own verification" ON public.users;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_generate_username ON public.users;
DROP TRIGGER IF EXISTS trigger_check_verification_expiry ON public.users;
DROP TRIGGER IF EXISTS trigger_check_password_reset_expiry ON public.users;

-- Drop functions
DROP FUNCTION IF EXISTS generate_username();
DROP FUNCTION IF EXISTS check_verification_code_expiry();
DROP FUNCTION IF EXISTS check_password_reset_expiry();

-- Drop constraints
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_username_format;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_room_number_format;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_verification_code_format;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_preferred_language;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email_verified;
DROP INDEX IF EXISTS idx_users_verification_code;
DROP INDEX IF EXISTS idx_users_password_reset_token;
DROP INDEX IF EXISTS idx_users_preferred_language;

-- Drop columns (CAREFUL! This will delete data!)
-- Uncomment only if you really want to remove these columns
-- ALTER TABLE public.users DROP COLUMN IF EXISTS username;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS phone_number;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS email_verified;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS verification_code;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS verification_code_expires;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS password_reset_token;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS password_reset_expires;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS remember_me;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS preferred_language;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS room_number;

