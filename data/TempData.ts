export interface Exercise {
  name: string;
  category: string;
  muscles: string[];
}

export const EXERCISES: Exercise[] = [
  {
    name: 'Overhead Press',
    category: 'Shoulder',
    muscles: ['deltoids', 'triceps'],
  },
  {
    name: 'Squat',
    category: 'Legs',
    muscles: ['quadriceps', 'glutes', 'hamstrings'],
  },
  {
    name: 'Bench Press',
    category: 'Chest',
    muscles: ['pectorals', 'triceps', 'deltoids'],
  },
  {
    name: 'Deadlift',
    category: 'Back',
    muscles: ['hamstrings', 'glutes', 'erector spinae', 'trapezius'],
  },
  {
    name: 'Pull-Up',
    category: 'Back',
    muscles: ['latissimus dorsi', 'biceps', 'forearms'],
  },
  {
    name: 'Barbell Row',
    category: 'Back',
    muscles: ['latissimus dorsi', 'trapezius', 'biceps'],
  },
  {
    name: 'Bicep Curl',
    category: 'Arms',
    muscles: ['biceps'],
  },
  {
    name: 'Tricep Pushdown',
    category: 'Arms',
    muscles: ['triceps'],
  },
  {
    name: 'Lunge',
    category: 'Legs',
    muscles: ['quadriceps', 'glutes', 'hamstrings'],
  },
  {
    name: 'Leg Press',
    category: 'Legs',
    muscles: ['quadriceps', 'glutes', 'hamstrings'],
  },
  {
    name: 'Chest Fly',
    category: 'Chest',
    muscles: ['pectorals', 'deltoids'],
  },
  {
    name: 'Shoulder Lateral Raise',
    category: 'Shoulder',
    muscles: ['deltoids'],
  },
  {
    name: 'Plank',
    category: 'Core',
    muscles: ['rectus abdominis', 'obliques', 'transverse abdominis'],
  },
  {
    name: 'Russian Twist',
    category: 'Core',
    muscles: ['obliques', 'rectus abdominis'],
  },
  {
    name: 'Face Pull',
    category: 'Back',
    muscles: ['rear deltoids', 'trapezius', 'rhomboids'],
  },
  {
    name: 'Dumbbell Shrug',
    category: 'Shoulder',
    muscles: ['trapezius'],
  },
  {
    name: 'Hip Thrust',
    category: 'Glutes',
    muscles: ['gluteus maximus', 'hamstrings'],
  },
  {
    name: 'Cable Crunch',
    category: 'Core',
    muscles: ['rectus abdominis'],
  },
];
