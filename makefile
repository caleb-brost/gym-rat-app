# Load environment if it exists
ifneq (,$(wildcard .env))
    include .env
    export
endif

ENV ?= local

.PHONY: help start start-local start-prod sync reset clean seed generate-types

help:
	@echo "GymRat Database Tools"
	@echo " ○ make start-local    - Start Docker + Expo (Local)"
	@echo " ○ make start-prod     - Start Expo (Production)"
	@echo " ○ make sync           - Reset DB + Seed + Generate Types"
	@echo " ○ make reset          - Wipe DB (Conditional)"
	@echo " ○ make seed           - Insert mock data"

start-local:
	@open -a Docker && npx supabase start
	@EXPO_PUBLIC_APP_ENV=local npx expo start

start-prod:
	@EXPO_PUBLIC_APP_ENV=production npx expo start

reset:
	@if [ "$(ENV)" = "production" ]; then \
		echo "!!! DANGER: Resetting PRODUCTION !!!"; \
		read -p "Are you sure? (y/N) " confirm && [ "$$confirm" = "y" ] && npx supabase db reset --linked --yes; \
	else \
		npx supabase db reset --yes; \
	fi

seed:
	@if [ "$(ENV)" = "production" ]; then \
		echo "Seeding production is not supported."; \
	else \
		echo "Seeding local database..."; \
		DB_URL=$$(npx supabase status -o env | grep '^DB_URL=' | cut -d= -f2- | tr -d '"'); \
		if [ -z "$$DB_URL" ]; then \
			echo "Unable to determine local DB URL from Supabase status."; \
			exit 1; \
		fi; \
		echo "Using local DB URL: $$DB_URL"; \
		psql "$$DB_URL" -f ./supabase/mock_data.sql; \
	fi

sync:
	@$(MAKE) reset
	@$(MAKE) seed
	@$(MAKE) generate-types

generate-types:
	@if [ "$(ENV)" = "production" ]; then \
		echo "Generating types from REMOTE database..."; \
		npx supabase gen types typescript --project-id "$(PROJECT_REF)" > types/supabase.ts; \
	else \
		echo "Generating types from LOCAL database..."; \
		npx supabase gen types typescript --local > types/supabase.ts; \
	fi