# LocalShow

## Elevator Pitch

LocalShow is a ticketing platform for small venues, DIY shows, bars, and local bands to create events, sell tickets, and manage attendance without relying on large ticketing companies. Fans can browse local shows, buy tickets, store them in their account, and present a QR-style ticket at the door.

## Problem Statement

Small venues and local artists often rely on platforms like Eventbrite or Ticketmaster-style services that can feel expensive, complicated, or built for larger events. Fees can cut into already-small margins, and local shows often need a simpler way to list events, sell tickets, and track who is attending.

This app solves that problem by giving local event organizers a lightweight ticketing tool focused specifically on small-to-mid-sized shows. Instead of trying to replace major ticketing companies, the project focuses on the core features a local venue or band actually needs: event creation, ticket sales, ticket storage, and check-in support.

## Target User

The primary target user is a small-to-mid-cap venue owner or event organizer who regularly hosts live music, comedy nights, open mics, DIY shows, or local events. This person needs a simple way to create an event page, set ticket availability, manage sales, and verify attendees at the door.

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

Run both apps:

```bash
pnpm dev
```

Default URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api/v1`
- Health: `http://localhost:4000/api/v1/health`

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
