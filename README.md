# LocalShow

## Elevator Pitch

LocalShow is a ticketing platform for local organizers, DIY shows, bars, venues, and bands to create events, sell tickets, and manage attendance without relying on large ticketing companies. Fans can browse local shows, buy tickets, store them in their account, and present a QR-style ticket at the door.

## Problem Statement

Small venues and local artists often rely on platforms like Eventbrite or Ticketmaster-style services that can feel expensive, complicated, or built for larger events. Fees can cut into already-small margins, and local shows often need a simpler way to list events, sell tickets, and track who is attending.

This app solves that problem by giving local event organizers a lightweight ticketing tool focused specifically on small-to-mid-sized shows. Instead of trying to replace major ticketing companies, the project focuses on the core features a local organizer, venue, or band actually needs: event creation, ticket sales, ticket storage, and check-in support.

## Target User

The primary target user is a small-to-mid-cap venue owner, promoter, band, DIY collective, or event organizer who regularly hosts live music, comedy nights, open mics, DIY shows, or local events. This person needs a simple way to create an event page, set ticket availability, manage sales, and verify attendees at the door.

A secondary target user is a local music fan who wants an easy way to discover nearby shows, buy tickets, keep those tickets in one place, and access them quickly when arriving at the event.

## Why This Project

I personally care about this project because I am in a band and have seen firsthand how frustrating ticketing platforms can be for smaller artists and venues. Local shows already operate on tight margins, and processing fees or complicated ticketing systems can make it harder for bands and venues to actually make money.

Building this project gives me a chance to solve a real problem I have experienced directly while also creating a full-stack application with practical features like user accounts, event listings, ticket purchasing, backend data handling, and event check-in logic.

## Technical Direction

LocalShow is being built as a production-shaped MVP, not a throwaway class demo.

- Frontend: Next.js, React, TypeScript, Tailwind
- Backend: NestJS, TypeScript
- Database: PostgreSQL with Prisma
- Auth: Clerk
- AI: OpenAI Responses API when `OPENAI_API_KEY` is configured, deterministic local fallback otherwise
- Uploads: local API-served image uploads for development; production should move poster storage to S3, Supabase Storage, or Cloudflare R2
- Email: database-backed notification outbox for purchase and transfer emails; provider delivery comes later
- Payments: mock checkout first, Stripe Checkout test mode after the ticketing flow is stable
- Deployment target: Vercel for web, Railway for API and Postgres

## Repository Structure

```txt
apps/
  web/      Next.js fan and organizer frontend
  api/      NestJS REST API
packages/
  shared/   Shared TypeScript contracts and enums
docs/       Architecture notes and implementation decisions
```

## Local Development

Install dependencies:

```bash
corepack prepare pnpm@9.15.4 --activate
pnpm install
```

Create local env:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Start Postgres if Docker is available:

```bash
docker compose up -d
```

Generate Prisma client and run migrations after Postgres is running:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Reset local demo data back to the clean demo organizer, venues, and events:

```bash
pnpm db:seed:reset
```

Use this when manual testing creates messy local events or tickets. It removes demo-owned events, venues, orders, tickets, and check-ins, then recreates the curated LocalShow demo data.

The web app only uses hardcoded fallback event data during production builds so deploy previews can compile without a live API. During local runtime, public event pages require `NEXT_PUBLIC_API_URL`; API or database problems should fail loudly instead of being hidden by mock events.

Run both apps:

```bash
pnpm dev
```

Default URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api/v1`
- Health: `http://localhost:4000/api/v1/health`

In local dev without Clerk keys, use the role switcher in the header to preview the Fan and Organizer experiences. Fan mode hides organizer tools and blocks dashboard routes; Organizer mode enables event, location, attendee, and check-in workflows. The onboarding page also updates this dev role cookie, so choosing "I run events" immediately opens the organizer workspace.

With Clerk keys configured, LocalShow stores the app role in Postgres and treats that database role as the source of truth. New Clerk users start as fans unless they explicitly choose "I run events" during onboarding. Organizer-only API routes still resolve the signed-in user, but they no longer auto-promote accounts; they return `403` until the user's saved role is `ORGANIZER` or `ADMIN`. When a user changes roles through onboarding, the API also best-effort syncs `publicMetadata.localshowRole` back to Clerk for visibility in Clerk-managed sessions and dashboards.

## Testing Without Real Money

LocalShow currently uses a mock checkout provider for local development. A mock purchase still creates real `Order`, `OrderItem`, and `Ticket` records in Postgres, but it does not call Stripe and does not move money.

Recommended local verification loop:

```bash
pnpm typecheck
pnpm lint
pnpm dev
```

In a second terminal, run the non-mutating smoke test:

```bash
pnpm smoke:local
```

This verifies the API, event discovery, organizer endpoints, fan wallet, invalid purchase guardrails, invalid check-in guardrails, and key web pages without creating orders or changing ticket status.

To test the full no-money purchase path, opt into the mutating smoke test:

```bash
LOCALSHOW_MUTATING_SMOKE=true pnpm smoke:local
```

That creates one mock order and one real ticket, then verifies the ticket detail API and ticket detail page. Use this when you want end-to-end confidence in the ticket creation path.

Manual no-money QA checklist:

- Create or edit a location from `/dashboard/venues`.
- Create an event from `/dashboard/events/new`.
- Edit event details from `/dashboard/events`.
- Adjust ticket capacity without reducing below sold count.
- Open the public event page and reserve a mock ticket.
- Confirm the app redirects to the ticket detail page with a QR code.
- Open `/dashboard/check-in`, select the correct event, and scan or paste the ticket code.
- Confirm a second check-in reports that the ticket was already checked in.

When Stripe is added, keep this mock checkout flow available for local development and use Stripe test mode cards only in staging.

## AI Event Copy Assistant

Organizers can draft event title, description, genre, and promo copy from `/dashboard/events/new`. In local development, the assistant works without external API calls by using a deterministic fallback. To enable OpenAI-backed suggestions, set these in `apps/api/.env`:

```bash
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-5.4-mini"
```

The fallback should stay enabled so demos, tests, and local development do not depend on network access or API credits.

## Event Posters

Organizers can upload event poster images from an event edit page. Local development stores files under `UPLOAD_DIR` and serves them from the API at `/uploads/...`.

```bash
API_PUBLIC_URL="http://localhost:4000"
UPLOAD_DIR="./uploads"
```

Local uploads are intentionally ignored by git. Before production launch, replace local filesystem storage with object storage such as S3, Supabase Storage, or Cloudflare R2 so uploaded posters survive deploys and can be served through a CDN.

## Email Outbox

LocalShow queues transactional emails in Postgres before a real email provider is connected. Mock purchases enqueue order confirmations, and ticket transfers enqueue sender/recipient notifications.

In development, inspect queued messages at:

```bash
curl "http://localhost:4000/api/v1/dev/email-outbox?limit=10"
```

The dev outbox endpoint is disabled when `NODE_ENV=production`. Before launch, connect a provider such as Postmark, Resend, SendGrid, or SES and process `QUEUED` messages into delivered email.

## MVP Scope

First milestone:

- Public event discovery
- Event detail pages
- Organizer event creation
- Ticket type inventory
- Mock checkout
- User ticket wallet
- QR/manual check-in
- AI event listing assistant

Explicitly out of scope for the MVP:

- Seat maps
- Refund automation
- Resale marketplace
- Complex payout logic
- Native mobile apps
- Dynamic pricing
