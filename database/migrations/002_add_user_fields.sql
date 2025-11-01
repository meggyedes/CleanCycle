-- Add new fields to users table for better user management
-- Powered by Daniel Soos 2025

-- Add new columns to users table
ALTER TABLE public.users
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN apartment_number TEXT,
ADD COLUMN remember_me BOOLEAN DEFAULT false,
ADD COLUMN last_login TIMESTAMPTZ;

-- Create index for apartment_number for faster lookups
CREATE INDEX idx_users_apartment_number ON public.users(apartment_number);

-- Update the trigger function to handle new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, first_name, last_name, apartment_number)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'apartment_number'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

