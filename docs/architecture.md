# Architectuur

## Doel

Een lean maar herbruikbare multi-tenant SaaS voor nichebedrijven, gestart met steigerbouw.

## Bouwdelen

- `app/`
  - App Router pagina's voor marketing, agency en tenant workspace
  - API routes voor tenant creatie en Stripe flows
- `components/`
  - Overzichtsblokken voor agency- en tenantdashboards
- `lib/`
  - Domeintypes, mock-data, validatie, Stripe helpers en Supabase clients
- `supabase/migrations/`
  - Datamodel, RLS en storage policies

## Multi-tenant model

- Elke record heeft `tenant_id`
- Agency admins mogen over tenants heen werken
- Tenant admins en staff zien alleen hun eigen organisatie
- Bestanden staan in een private bucket met padprefix per tenant

## Billing model

- Agency maakt tenant handmatig aan
- Agency start Stripe Checkout voor een pakket
- Stripe webhook synchroniseert subscription status terug naar `subscriptions` en `tenants`

## AVG-model

- Geen publieke buckets
- Alleen noodzakelijke persoonsgegevens
- Audit logs voor gevoelige beheeracties
- Voorbereiding voor export/verwijderen per tenant

