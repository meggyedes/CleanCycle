-- CleanCycle Database Schema
-- Powered by Daniel Soos 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'manager', 'admin');
CREATE TYPE machine_type AS ENUM ('washer', 'dryer');
CREATE TYPE machine_status AS ENUM ('free', 'running', 'booked', 'maintenance', 'broken');
CREATE TYPE session_status AS ENUM ('active', 'finished', 'cancelled');
CREATE TYPE notification_type AS ENUM ('reminder', 'expired', 'forgotten', 'system');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Rooms table
CREATE TABLE public.rooms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Machines table
CREATE TABLE public.machines (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type machine_type NOT NULL,
    status machine_status DEFAULT 'free' NOT NULL,
    default_duration INTEGER DEFAULT 60 NOT NULL, -- minutes
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Sessions table
CREATE TABLE public.sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    machine_id INTEGER NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    actual_end TIMESTAMPTZ,
    status session_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notifications table
CREATE TABLE public.notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Logs table
CREATE TABLE public.logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    machine_id INTEGER REFERENCES public.machines(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    details JSONB
);

-- Create indexes for better performance
CREATE INDEX idx_machines_room_id ON public.machines(room_id);
CREATE INDEX idx_machines_status ON public.machines(status);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_machine_id ON public.sessions(machine_id);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_sessions_end_time ON public.sessions(end_time);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_logs_user_id ON public.logs(user_id);
CREATE INDEX idx_logs_machine_id ON public.logs(machine_id);
CREATE INDEX idx_logs_timestamp ON public.logs(timestamp);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can do everything with users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Rooms policies
CREATE POLICY "Everyone can view rooms" ON public.rooms
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify rooms" ON public.rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Machines policies
CREATE POLICY "Everyone can view machines" ON public.machines
    FOR SELECT USING (true);

CREATE POLICY "Managers and admins can update machines" ON public.machines
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

CREATE POLICY "Only admins can insert/delete machines" ON public.machines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON public.sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create own sessions" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can modify all sessions" ON public.sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Logs policies
CREATE POLICY "Only admins can view logs" ON public.logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert logs" ON public.logs
    FOR INSERT WITH CHECK (true);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log machine status changes
CREATE OR REPLACE FUNCTION public.log_machine_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.logs (machine_id, action, details)
        VALUES (
            NEW.id,
            'status_changed',
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for machine status changes
CREATE TRIGGER on_machine_status_changed
    AFTER UPDATE ON public.machines
    FOR EACH ROW EXECUTE FUNCTION public.log_machine_status_change();

-- Insert initial rooms
INSERT INTO public.rooms (name, description) VALUES
    ('Kis Mosószoba', '3 mosógép és 3 szárítógép'),
    ('Nagy Mosószoba', '5 mosógép és 5 szárítógép');

-- Insert machines for Kis Mosószoba (room_id = 1)
INSERT INTO public.machines (room_id, name, type, default_duration) VALUES
    (1, 'Kis Mosó 1', 'washer', 60),
    (1, 'Kis Mosó 2', 'washer', 60),
    (1, 'Kis Mosó 3', 'washer', 60),
    (1, 'Kis Szárító 1', 'dryer', 90),
    (1, 'Kis Szárító 2', 'dryer', 90),
    (1, 'Kis Szárító 3', 'dryer', 90);

-- Insert machines for Nagy Mosószoba (room_id = 2)
INSERT INTO public.machines (room_id, name, type, default_duration) VALUES
    (2, 'Nagy Mosó 1', 'washer', 60),
    (2, 'Nagy Mosó 2', 'washer', 60),
    (2, 'Nagy Mosó 3', 'washer', 60),
    (2, 'Nagy Mosó 4', 'washer', 60),
    (2, 'Nagy Mosó 5', 'washer', 60),
    (2, 'Nagy Szárító 1', 'dryer', 90),
    (2, 'Nagy Szárító 2', 'dryer', 90),
    (2, 'Nagy Szárító 3', 'dryer', 90),
    (2, 'Nagy Szárító 4', 'dryer', 90),
    (2, 'Nagy Szárító 5', 'dryer', 90);

