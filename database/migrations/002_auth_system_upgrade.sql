-- =====================================================
-- CleanCycle - Auth System Upgrade Migration
-- Powered by Daniel Soos 2025
-- =====================================================
-- 
-- Ez a migráció frissíti az auth rendszert a következő funkciókkal:
-- 1. Username mező hozzáadása
-- 2. Telefonszám mező hozzáadása
-- 3. Szobaszám (room_number) mező átnevezése apartment_number-ről
-- 4. Email verifikációs rendszer (6 számjegyű kód)
-- 5. Jelszó visszaállítási token rendszer
-- 6. Remember me funkció
-- =====================================================

-- 1. Users tábla módosítása
ALTER TABLE public.users
  -- Username hozzáadása (egyedi, kötelező)
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
  
  -- Telefonszám hozzáadása (opcionális)
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
  
  -- Email verifikáció
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
  ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMPTZ,
  
  -- Jelszó visszaállítás
  ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ,
  
  -- Remember me funkció
  ADD COLUMN IF NOT EXISTS remember_me BOOLEAN DEFAULT FALSE,
  
  -- Nyelvi preferencia
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- 2. Apartment_number átnevezése room_number-re (ha létezik), vagy létrehozása
DO $$
BEGIN
  -- Ha létezik apartment_number, átnevezzük
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'apartment_number'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN apartment_number TO room_number;
  -- Ha nem létezik apartment_number, de nem létezik room_number sem, létrehozzuk
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'room_number'
  ) THEN
    ALTER TABLE public.users ADD COLUMN room_number VARCHAR(10);
  END IF;

  -- Room_number típusának módosítása VARCHAR(10)-re (ha már létezik)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'room_number'
  ) THEN
    ALTER TABLE public.users ALTER COLUMN room_number TYPE VARCHAR(10);
  END IF;
END $$;

-- 4. Indexek létrehozása a jobb teljesítményért
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON public.users(verification_code);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON public.users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON public.users(preferred_language);

-- 5. Constraint-ek hozzáadása (csak ha még nem léteznek)
DO $$
BEGIN
  -- Username format constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_username_format'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT check_username_format
        CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]+$');
  END IF;

  -- Room number format constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_room_number_format'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT check_room_number_format
        CHECK (room_number IS NULL OR room_number ~ '^[0-9]+$');
  END IF;

  -- Verification code format constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_verification_code_format'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT check_verification_code_format
        CHECK (verification_code IS NULL OR verification_code ~ '^[0-9]{6}$');
  END IF;

  -- Preferred language constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_preferred_language'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT check_preferred_language
        CHECK (preferred_language IN ('en', 'hu', 'nl', 'de', 'fr', 'it', 'be', 'bg', 'sk'));
  END IF;
END $$;

-- 6. Trigger: Automatikus username generálás, ha nincs megadva
CREATE OR REPLACE FUNCTION generate_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL THEN
    -- Ellenőrizzük, hogy léteznek-e a first_name és last_name mezők
    IF TG_TABLE_NAME = 'users' THEN
      NEW.username := 'user_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_username ON public.users;
CREATE TRIGGER trigger_generate_username
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION generate_username();

-- 7. Trigger: Verifikációs kód lejárat ellenőrzése
CREATE OR REPLACE FUNCTION check_verification_code_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_code IS NOT NULL AND NEW.verification_code_expires < NOW() THEN
    NEW.verification_code := NULL;
    NEW.verification_code_expires := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_verification_expiry ON public.users;
CREATE TRIGGER trigger_check_verification_expiry
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION check_verification_code_expiry();

-- 8. Trigger: Jelszó reset token lejárat ellenőrzése
CREATE OR REPLACE FUNCTION check_password_reset_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.password_reset_token IS NOT NULL AND NEW.password_reset_expires < NOW() THEN
    NEW.password_reset_token := NULL;
    NEW.password_reset_expires := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_password_reset_expiry ON public.users;
CREATE TRIGGER trigger_check_password_reset_expiry
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION check_password_reset_expiry();

-- 9. RLS Policy frissítések
DO $$
BEGIN
  -- Felhasználók láthatják saját verifikációs státuszukat
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Users can view own verification status'
  ) THEN
    CREATE POLICY "Users can view own verification status"
      ON public.users
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  -- Felhasználók frissíthetik saját verifikációs kódjukat
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Users can update own verification'
  ) THEN
    CREATE POLICY "Users can update own verification"
      ON public.users
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 10. Kommentek a dokumentációhoz
COMMENT ON COLUMN public.users.username IS 'Egyedi felhasználónév (csak betűk, számok, aláhúzás)';
COMMENT ON COLUMN public.users.phone_number IS 'Telefonszám (opcionális, különböző formátumok támogatva)';
COMMENT ON COLUMN public.users.room_number IS 'Szobaszám (csak számok, K prefix nélkül)';
COMMENT ON COLUMN public.users.email_verified IS 'Email cím megerősítve';
COMMENT ON COLUMN public.users.verification_code IS '6 számjegyű email verifikációs kód';
COMMENT ON COLUMN public.users.verification_code_expires IS 'Verifikációs kód lejárati ideje';
COMMENT ON COLUMN public.users.password_reset_token IS 'Jelszó visszaállítási token';
COMMENT ON COLUMN public.users.password_reset_expires IS 'Jelszó reset token lejárati ideje';
COMMENT ON COLUMN public.users.remember_me IS 'Emlékezz rám funkció engedélyezve';
COMMENT ON COLUMN public.users.preferred_language IS 'Felhasználó preferált nyelve (en, hu, nl, de, fr, it, be, bg, sk)';

-- =====================================================
-- MIGRÁCIÓ VÉGE
-- =====================================================

-- Ellenőrző lekérdezések:
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

