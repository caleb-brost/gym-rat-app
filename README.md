GymRat/
├── app/                             # Expo Router navigation
│   ├── (auth)/                      # Auth routes group
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   ├── (main)/                      # Main app routes group
│   │   ├── index.tsx                # Dashboard or home
│   │   ├── workouts/
│   │   │   ├── index.tsx            # Workout list
│   │   │   ├── [id].tsx             # Single workout page=
│   │   │   └── new.tsx              # New workout page
│   │   │
│   │   └── exercises/
│   │       ├── index.tsx            # All exercises
│   │       └── new.tsx              # Add exercise
│   │
│   └── _layout.tsx                  # Main navigation layout
│
├── assets/                          # Images, fonts, icons, etc.
│
├── components/                      # Shared UI components
│   ├── ExerciseForm.tsx
│   ├── WorkoutCard.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   └── LoadingSpinner.tsx
│
├── constants/                       # Static values or enums
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
│
├── context/                         # App-wide state (providers)
│   ├── AuthContext.tsx
│   └── ActiveWorkoutContext.tsx
│
├── db/                              # Supabase + DB config
│   ├── client.ts                    # Supabase client setup
│   └── schema.sql                   # Optional: SQL table definitions
│
├── features/                        # Hybrid feature structure
│   ├── workouts/
│   │   ├── api.ts                   # CRUD requests
│   │   ├── hooks.ts                 # useAddWorkout, useGetWorkouts
│   │   ├── utils.ts                 # feature-specific helpers
│   │   └── types.ts
│   │
│   ├── exercises/
│   │   ├── api.ts                   # CRUD for exercises
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   │
│   └── auth/
│       ├── api.ts
│       ├── hooks.ts
│       └── types.ts
│
├── hooks/                           # Shared hooks (not feature-specific)
│   ├── useAuth.ts
│   ├── useTheme.ts
│   └── useOnlineStatus.ts
│
├── lib/                             # Shared library setup (infrastructure)
│   ├── navigation.ts                # Expo router helpers
│   ├── supabase.ts                  # Supabase setup (if not in /db)
│   ├── storage.ts                   # AsyncStorage helpers
│   └── logger.ts                    # Logging/debug utilities
│
├── .env                             # Environment variables
├── .gitignore
├── app.json
├── expo-env.d.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
