# SteigerHub MVP

Mobile-first multi-tenant SaaS MVP for scaffold builders with:

- agency dashboard for internal operations
- tenant workspace for dossier management
- Supabase auth/database/storage with RLS
- Stripe subscription billing hooks
- AVG-oriented defaults

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Stripe

## Local setup

1. Install Node.js 20+ and npm.
2. Copy `.env.example` to `.env.local` and fill in the values.
3. Install dependencies with `npm install`.
4. Run `npm run dev`.
5. Apply SQL from [0001_init.sql](/C:/Users/hoffm/OneDrive/AAA-codex/supabase/migrations/0001_init.sql) in your Supabase project.
6. Apply [0002_seed_demo.sql](/C:/Users/hoffm/OneDrive/AAA-codex/supabase/migrations/0002_seed_demo.sql) if you want demo tenants and dossiers in your database.
7. Add `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` if you want the dashboards to read live Supabase data before auth is finished.

## MVP capabilities

- Agency admins can oversee tenants, subscriptions and module settings.
- Tenant admins and staff can manage dossiers, notes and files.
- Module toggles and custom fields are configurable per tenant.
- Stripe checkout, billing portal and webhook sync are scaffolded.

## Important notes

- Stripe price IDs and Supabase project details must be configured before runtime.
- Without `SUPABASE_SERVICE_ROLE_KEY`, dashboards fall back to mock preview data.
- Storage buckets should remain private; signed URLs are expected for file access.
