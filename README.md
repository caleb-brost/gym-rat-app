## Start Project
`npx expo start`


# Generate Supabase Types
`npx supabase gen types typescript --project-id rkdgcxrqascpfnidrayg > ./types/supabase.ts`
`npx supabase login`

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

## Supabase types

- Place `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_ACCESS_TOKEN` in `.env` (or export them before running the script).
- Optionally set `SUPABASE_SCHEMAS` (defaults to `public`) to include additional schemas.
- Run `npm run supabase:types` to regenerate `types/supabase.ts`.

## Data access layers

- `db/supabaseClient.ts` – single typed Supabase client that reads credentials from `.env`.
- `lib/supabase/errors.ts` – helper for normalising Supabase/Postgrest error messages.
- `features/exercises/types.ts` – shared Exercise DTO and payload types.
- `features/exercises/api.ts` – Supabase reads/writes (`list`, `create`, `update`, `delete`, `get`) for the exercises domain.
- `features/exercises/hooks.ts` – React hook exposing fetched exercises plus create/update/delete helpers with loading state.
- `features/exercises/components/ExerciseSearch.tsx` – search container that wires the search bar and list together.
- `features/exercises/components/ExerciseSearchBar.tsx` – reusable search input.
- `features/exercises/components/ExerciseList.tsx` / `ExerciseCard.tsx` – results list and individual row presentation.
- `features/exercises/components/ExerciseFormModal.tsx` – shared modal used for creating and editing exercises.
- `features/auth/api.ts` / `hooks.ts` / `types.ts` – Supabase auth helpers shared by sign-in, sign-up, and profile screens.
- Avatar uploads expect a Supabase storage bucket named `avatars` with policies that let users read/write their own file (see `features/auth/api.ts`) and `expo-image-picker` installed in the Expo app.
