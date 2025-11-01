-- Seed test data for CleanCycle
-- Run this in Supabase SQL Editor to populate test data

-- First, check and delete existing data if needed
-- DELETE FROM public.machines;
-- DELETE FROM public.rooms;

-- Insert test machines for kisszoba (small room)
INSERT INTO public.machines (room_id, name, type, status, default_duration)
SELECT r.id, m.name, m.type, m.status, m.default_duration
FROM (
  SELECT 'kisszoba' as room_name, 'Mosógép 1' as name, 'washer'::machine_type as type, 'free'::machine_status as status, 60 as default_duration
  UNION ALL SELECT 'kisszoba', 'Mosógép 2', 'washer', 'free', 60
  UNION ALL SELECT 'kisszoba', 'Szárítógép 1', 'dryer', 'free', 45
  UNION ALL SELECT 'kisszoba', 'Szárítógép 2', 'dryer', 'running', 45
) m
JOIN public.rooms r ON r.name = m.room_name
WHERE NOT EXISTS (
  SELECT 1 FROM public.machines WHERE name = m.name
);

-- Insert test machines for nagyszoba (large room)
INSERT INTO public.machines (room_id, name, type, status, default_duration)
SELECT r.id, m.name, m.type, m.status, m.default_duration
FROM (
  SELECT 'nagyszoba' as room_name, 'Mosógép 3' as name, 'washer'::machine_type as type, 'free'::machine_status as status, 60 as default_duration
  UNION ALL SELECT 'nagyszoba', 'Mosógép 4', 'washer', 'booked', 60
  UNION ALL SELECT 'nagyszoba', 'Szárítógép 3', 'dryer', 'free', 45
  UNION ALL SELECT 'nagyszoba', 'Szárítógép 4', 'dryer', 'maintenance', 45
) m
JOIN public.rooms r ON r.name = m.room_name
WHERE NOT EXISTS (
  SELECT 1 FROM public.machines WHERE name = m.name
);

-- Insert test sessions (past sessions for statistics)
-- Note: Replace 'YOUR_USER_ID' with an actual user ID from auth.users
-- You can find your user ID by running: SELECT id FROM auth.users LIMIT 1;

-- Example sessions (uncomment and replace YOUR_USER_ID):
-- INSERT INTO public.sessions (user_id, machine_id, start_time, end_time, status) VALUES
--   ('YOUR_USER_ID', 1, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days 23 hours', 'finished'),
--   ('YOUR_USER_ID', 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days 23 hours 45 minutes', 'finished'),
--   ('YOUR_USER_ID', 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 23 hours', 'finished'),
--   ('YOUR_USER_ID', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 'finished')
-- ON CONFLICT DO NOTHING;

-- Insert test reservations
-- INSERT INTO public.reservations (user_id, machine_id, start_time, end_time, status) VALUES
--   ('YOUR_USER_ID', 1, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 1 hour', 'pending'),
--   ('YOUR_USER_ID', 3, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 45 minutes', 'confirmed')
-- ON CONFLICT DO NOTHING;

-- Verify data was inserted
SELECT 'Rooms:' as info, COUNT(*) as count FROM public.rooms
UNION ALL
SELECT 'Machines:', COUNT(*) FROM public.machines
UNION ALL
SELECT 'Sessions:', COUNT(*) FROM public.sessions;

