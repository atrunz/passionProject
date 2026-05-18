# LocalShow Architecture

LocalShow is organized as a monorepo with two deployable applications and one shared package.

## Apps

- `apps/web`: Next.js frontend for fans and organizers.
- `apps/api`: NestJS backend API.
- `packages/shared`: shared TypeScript contracts and enums.

## First Production Boundary

The API owns business rules for inventory, ticket ownership, organizer permissions, and check-in validation. The frontend never mutates ticket state directly.

## Initial Deployment Target

- Web: Vercel
- API: Railway
- Database: Railway Postgres
- Auth: Clerk
- Payments: mock first, Stripe Checkout test mode next
