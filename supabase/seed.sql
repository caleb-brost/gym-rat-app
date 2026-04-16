-- CLEANUP (Optional: ensures a truly blank slate if not using db reset)
TRUNCATE public.equipment, public.exercises RESTART IDENTITY CASCADE;

-- THE SEED SCRIPT
WITH 
-- Insert Equipment and capture IDs
inserted_equipment AS (
    INSERT INTO public.equipment (name, description) VALUES
    ('Barbell', 'Standard 20kg Olympic bar'),
    ('Dumbbell', 'Pair of hex or adjustable dumbbells'),
    ('Bench', 'Adjustable weight bench'),
    ('Cable Machine', 'Dual pulley functional trainer'),
    ('Squat Rack', 'Power cage or squat stand'),
    ('Kettlebell', 'Cast iron or competition kettlebell'),
    ('Pull-up Bar', 'Wall mounted or part of a rack'),
    ('None', 'Bodyweight exercise')
    RETURNING id, name
),
-- Helper to grab IDs easily
eq AS (SELECT id, name FROM inserted_equipment)

-- Insert Exercises using the IDs from above
INSERT INTO public.exercises (name, equipment_id, category, type, muscle_groups, description) VALUES
-- PUSH
('Bench Press', (SELECT id FROM eq WHERE name = 'Barbell'), 'Push', 'weight', ARRAY['Chest', 'Triceps', 'Shoulders']::public.muscle_group[], 'The gold standard for chest development.'),
('Overhead Press', (SELECT id FROM eq WHERE name = 'Barbell'), 'Push', 'weight', ARRAY['Shoulders', 'Triceps']::public.muscle_group[], 'Standing barbell shoulder press.'),
('Dumbbell Flys', (SELECT id FROM eq WHERE name = 'Dumbbell'), 'Push', 'weight', ARRAY['Chest']::public.muscle_group[], 'Isolation movement for the pectorals.'),
('Incline Dumbbell Press', (SELECT id FROM eq WHERE name = 'Dumbbell'), 'Push', 'weight', ARRAY['Chest', 'Shoulders', 'Triceps']::public.muscle_group[], 'Focuses on the upper chest.'),
('Cable Tricep Pushdown', (SELECT id FROM eq WHERE name = 'Cable Machine'), 'Push', 'weight', ARRAY['Triceps']::public.muscle_group[], 'Isolation for the back of the arms.'),

-- PULL
('Deadlift', (SELECT id FROM eq WHERE name = 'Barbell'), 'Pull', 'weight', ARRAY['Back', 'Hamstrings', 'Glutes']::public.muscle_group[], 'Fundamental posterior chain movement.'),
('Pull Up', (SELECT id FROM eq WHERE name = 'Pull-up Bar'), 'Pull', 'weight', ARRAY['Back', 'Biceps']::public.muscle_group[], 'Classic bodyweight back exercise.'),
('Barbell Row', (SELECT id FROM eq WHERE name = 'Barbell'), 'Pull', 'weight', ARRAY['Back', 'Biceps', 'Forearms']::public.muscle_group[], 'Heavy compound rowing.'),
('Face Pulls', (SELECT id FROM eq WHERE name = 'Cable Machine'), 'Pull', 'weight', ARRAY['Rear Deltoids', 'Traps']::public.muscle_group[], 'Great for shoulder health and posture.'),
('Hammer Curls', (SELECT id FROM eq WHERE name = 'Dumbbell'), 'Pull', 'weight', ARRAY['Biceps', 'Forearms']::public.muscle_group[], 'Builds biceps and brachialis.'),

-- LEGS
('Back Squat', (SELECT id FROM eq WHERE name = 'Squat Rack'), 'Legs', 'weight', ARRAY['Quadriceps', 'Glutes', 'Hamstrings']::public.muscle_group[], 'The king of leg exercises.'),
('Romanian Deadlift', (SELECT id FROM eq WHERE name = 'Barbell'), 'Legs', 'weight', ARRAY['Hamstrings', 'Glutes']::public.muscle_group[], 'Focuses on the eccentric load of the hamstrings.'),
('Bulgarian Split Squat', (SELECT id FROM eq WHERE name = 'Dumbbell'), 'Legs', 'weight', ARRAY['Quadriceps', 'Glutes']::public.muscle_group[], 'Unilateral leg strength.'),
('Calf Raises', (SELECT id FROM eq WHERE name = 'None'), 'Legs', 'weight', ARRAY['Calves']::public.muscle_group[], 'Can be done weighted or bodyweight.'),

-- CARDIO / OTHER
('Treadmill Run', (SELECT id FROM eq WHERE name = 'None'), 'Cardio', 'distance', ARRAY['Quadriceps', 'Calves']::public.muscle_group[], 'Steady state or HIIT cardio.'),
('Plank', (SELECT id FROM eq WHERE name = 'None'), 'Mobility', 'time', ARRAY['Core']::public.muscle_group[], 'Isometric core stability.'),
('Kettlebell Swing', (SELECT id FROM eq WHERE name = 'Kettlebell'), 'Other', 'weight', ARRAY['Glutes', 'Hamstrings', 'Back']::public.muscle_group[], 'Explosive hip hinge.');