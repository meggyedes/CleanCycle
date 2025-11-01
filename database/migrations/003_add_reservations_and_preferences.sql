-- CleanCycle Database Schema - Part 5 Enhancements
-- Powered by Daniel Soos 2025

-- Create new types for reservations and notifications
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE notification_channel AS ENUM ('email', 'push', 'in_app');

-- User Preferences table
CREATE TABLE public.user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    phone TEXT,
    language TEXT DEFAULT 'en' NOT NULL,
    email_notifications BOOLEAN DEFAULT true NOT NULL,
    push_notifications BOOLEAN DEFAULT true NOT NULL,
    in_app_notifications BOOLEAN DEFAULT true NOT NULL,
    notification_reminder_minutes INTEGER DEFAULT 15 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reservations table
CREATE TABLE public.reservations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    machine_id INTEGER NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status reservation_status DEFAULT 'pending' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Machine Error Codes table
CREATE TABLE public.machine_errors (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    error_code TEXT NOT NULL,
    error_message TEXT NOT NULL,
    severity TEXT DEFAULT 'warning' NOT NULL, -- 'info', 'warning', 'critical'
    resolved BOOLEAN DEFAULT false NOT NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Activity Logs table (enhanced from existing logs)
CREATE TABLE public.activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    machine_id INTEGER REFERENCES public.machines(id) ON DELETE SET NULL,
    session_id INTEGER REFERENCES public.sessions(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'session_start', 'session_end', 'reservation_created', 'error_reported', etc.
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notification Delivery Logs table
CREATE TABLE public.notification_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    notification_id INTEGER REFERENCES public.notifications(id) ON DELETE SET NULL,
    channel notification_channel NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'sent', 'failed', 'read'
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Machine Maintenance History table
CREATE TABLE public.maintenance_history (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL, -- 'preventive', 'corrective', 'inspection'
    description TEXT NOT NULL,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add new columns to users table for profile information
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS apartment_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMPTZ;

-- Add new columns to machines table for additional info
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS capacity_kg DECIMAL(5,2);
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS error_code TEXT;
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS last_maintenance TIMESTAMPTZ;

-- Create indexes for better performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX idx_reservations_machine_id ON public.reservations(machine_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_start_time ON public.reservations(start_time);
CREATE INDEX idx_machine_errors_machine_id ON public.machine_errors(machine_id);
CREATE INDEX idx_machine_errors_resolved ON public.machine_errors(resolved);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_machine_id ON public.activity_logs(machine_id);
CREATE INDEX idx_activity_logs_action_type ON public.activity_logs(action_type);
CREATE INDEX idx_activity_logs_timestamp ON public.activity_logs(timestamp);
CREATE INDEX idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX idx_notification_logs_channel ON public.notification_logs(channel);
CREATE INDEX idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX idx_maintenance_history_machine_id ON public.maintenance_history(machine_id);
CREATE INDEX idx_maintenance_history_start_time ON public.maintenance_history(start_time);

-- Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;

-- User Preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reservations policies
CREATE POLICY "Users can view own reservations" ON public.reservations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reservations" ON public.reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can create own reservations" ON public.reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations" ON public.reservations
    FOR UPDATE USING (auth.uid() = user_id);

-- Machine Errors policies
CREATE POLICY "Everyone can view machine errors" ON public.machine_errors
    FOR SELECT USING (true);

CREATE POLICY "Managers and admins can update errors" ON public.machine_errors
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Activity Logs policies
CREATE POLICY "Only admins can view activity logs" ON public.activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);

-- Notification Logs policies
CREATE POLICY "Users can view own notification logs" ON public.notification_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification logs" ON public.notification_logs
    FOR INSERT WITH CHECK (true);

-- Maintenance History policies
CREATE POLICY "Everyone can view maintenance history" ON public.maintenance_history
    FOR SELECT USING (true);

CREATE POLICY "Managers and admins can manage maintenance" ON public.maintenance_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

