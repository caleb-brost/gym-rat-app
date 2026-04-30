-- CLEANUP
TRUNCATE public.profiles, public.equipment, public.exercises RESTART IDENTITY CASCADE;

-- supabase/seed.sql
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, aud, role
) VALUES (
  'aac7e28d-1d18-4646-be71-6295213adef3'::uuid,
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Insert admin user into profiles
INSERT INTO public.profiles (id, username) 
VALUES ('aac7e28d-1d18-4646-be71-6295213adef3', 'admin')
ON CONFLICT (id) DO NOTHING;

-- MOCK DATA
-- Insert Equipment and capture IDs
WITH inserted_equipment AS (
    INSERT INTO public.equipment (name, description) VALUES
    ('Barbell', 'Standard 45lb Olympic bar'),
    ('Dumbbell', 'Pair or adjustable dumbbells'),
    ('Bench', 'Adjustable weight bench'),
    ('Cable Machine', 'Dual pulley functional trainer'),
    ('Squat Rack', 'Power cage or squat stand'),
    ('Kettlebell', 'Cast iron or competition kettlebell'),
    ('Pull-up Bar', 'Wall mounted or part of a rack'),
    ('None', 'Bodyweight exercise')
    RETURNING id, name
),
-- Helper to reference equipment IDs by name
eq AS (SELECT id, name FROM inserted_equipment),
admin_user AS (SELECT 'aac7e28d-1d18-4646-be71-6295213adef3'::uuid as id)
	

-- Insert Exercises linking both the Admin User and the Equipment
INSERT INTO public.exercises (user_id, name, equipment_id, category, type, muscle_groups, description) VALUES
-- PUSH
((SELECT id FROM admin_user), 'Bench Press', (SELECT id FROM eq WHERE name = 'Barbell'), 'Push', 'weight', ARRAY['Chest', 'Triceps', 'Shoulders']::public.muscle_group[], 'The gold standard for chest development.'),
((SELECT id FROM admin_user), 'Overhead Press', (SELECT id FROM eq WHERE name = 'Barbell'), 'Push', 'weight', ARRAY['Shoulders', 'Triceps']::public.muscle_group[], 'Standing barbell shoulder press.'),
((SELECT id FROM admin_user), 'Dumbbell Flys', (SELECT id FROM eq WHERE name = 'Dumbbell'), 'Push', 'weight', ARRAY['Chest']::public.muscle_group[], 'Isolation movement for the pectorals.'),
((SELECT id FROM admin_user), 'Incline Dumbbell Press', (SELECT id FROM eq WHERE name = 'Dumbbell'), 'Push', 'weight', ARRAY['Chest', 'Shoulders', 'Triceps']::public.muscle_group[], 'Focuses on the upper chest.'),
((SELECT id FROM admin_user), 'Cable Tricep Pushdown', (SELECT id FROM eq WHERE name = 'Cable Machine'), 'Push', 'weight', ARRAY['Triceps']::public.muscle_group[], 'Isolation for the back of the arms.'),

-- PULL
((SELECT id FROM admin_user), 'Deadlift', (SELECT id FROM eq WHERE name = 'Barbell'), 'Pull', 'weight', ARRAY['Back', 'Hamstrings', 'Glutes']::public.muscle_group[], 'Fundamental posterior chain movement.'),
((SELECT id FROM admin_user), 'Pull Up', (SELECT id FROM eq WHERE name = 'Pull-up Bar'), 'Pull', 'weight', ARRAY['Back', 'Biceps']::public.muscle_group[], 'Classic bodyweight back exercise.'),
((SELECT id FROM admin_user), 'Barbell Row', (SELECT id FROM eq WHERE name = 'Barbell'), 'Pull', 'weight', ARRAY['Back', 'Biceps', 'Forearms']::public.muscle_group[], 'Heavy compound rowing.'),
((SELECT id FROM admin_user), 'Face Pulls', (SELECT id FROM eq WHERE name = 'Cable Machine'), 'Pull', 'weight', ARRAY['Rear Deltoids', 'Traps']::public.muscle_group[], 'Great for shoulder health and posture.'),
((SELECT id FROM admin_user), 'Hammer Curls', (SELECT id FROM eq WHERE name = 'Dumbbell'), 'Pull', 'weight', ARRAY['Biceps', 'Forearms']::public.muscle_group[], 'Builds biceps and brachialis.'),

-- LEGS
((SELECT id FROM admin_user), 'Back Squat', (SELECT id FROM eq WHERE name = 'Squat Rack'), 'Legs', 'weight', ARRAY['Quadriceps', 'Glutes', 'Hamstrings']::public.muscle_group[], 'The king of leg exercises.'),
((SELECT id FROM admin_user), 'Romanian Deadlift', (SELECT id FROM eq WHERE name = 'Barbell'), 'Legs', 'weight', ARRAY['Hamstrings', 'Glutes']::public.muscle_group[], 'Focuses on the eccentric load of the hamstrings.'),
((SELECT id FROM admin_user), 'Bulgarian Split Squat', (SELECT id FROM eq WHERE name = 'Dumbbell'), 'Legs', 'weight', ARRAY['Quadriceps', 'Glutes']::public.muscle_group[], 'Unilateral leg strength.'),
((SELECT id FROM admin_user), 'Calf Raises', (SELECT id FROM eq WHERE name = 'None'), 'Legs', 'weight', ARRAY['Calves']::public.muscle_group[], 'Can be done weighted or bodyweight.'),

-- CARDIO / OTHER
((SELECT id FROM admin_user), 'Treadmill Run', (SELECT id FROM eq WHERE name = 'None'), 'Cardio', 'distance', ARRAY['Quadriceps', 'Calves']::public.muscle_group[], 'Steady state or HIIT cardio.'),
((SELECT id FROM admin_user), 'Plank', (SELECT id FROM eq WHERE name = 'None'), 'Mobility', 'time', ARRAY['Core']::public.muscle_group[], 'Isometric core stability.'),
((SELECT id FROM admin_user), 'Kettlebell Swing', (SELECT id FROM eq WHERE name = 'Kettlebell'), 'Other', 'weight', ARRAY['Glutes', 'Hamstrings', 'Back']::public.muscle_group[], 'Explosive hip hinge.');