# Load environment variables from .env
ifneq ("$(wildcard .env)","")
    include .env
    export
endif

.PHONY: help migration sync push types login

# Help Menu
help:
	@echo "GymRat Database Tools"
	@echo " ○ make migration name=xxx - Create a new timestamped SQL migration"
	@echo " ○ make sync               - Push local SQL to Supabase AND regenerate types"
	@echo " ○ make wipe-db            - WARNING: Completely wipe the remote database"
	@echo " ○ make push               - Only push SQL migrations to the cloud"
	@echo " ○ make generate-types     - Only regenerate TypeScript types from the cloud"
	@echo " ○ make login              - Log in to Supabase CLI"

# Create a new migration file (Handles the timestamp for you)
# Usage: make migration name=add_calories_column
migration:
	@npx supabase migration new $(name)

# The Full Workflow
# This pushes your local SQL changes, then asks the cloud for the new types.
sync:
	@$(MAKE) wipe-db
	@$(MAKE) generate-types
	@echo "Sync Complete: Cloud DB and Local Types are matching."

wipe-db:
	@echo "Wiping remote database at $(EXPO_PUBLIC_SUPABASE_URL)..."
	@SUPABASE_DB_PASSWORD=$(SUPABASE_DB_PASSWORD) npx supabase db reset --linked --yes

# Push SQL to Cloud
push:
	@echo "Pushing SQL migrations to glvcfjkxqjnylbvrshxu..."
	@npx supabase db push

# Generate Types (The .mjs script)
generate-types:
	@echo "Regenerating types from live database..."
	@node scripts/generate-supabase-types.mjs

# Login
login:
	@npx supabase login

# Run on local host
run:
	@echo "Starting local development server..."
	@npx expo start