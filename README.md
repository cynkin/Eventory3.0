# Eventory v3.0

A full-stack event booking platform built with **Next.js 16 (App Router)**, **Prisma + PostgreSQL**, **NextAuth v5**, and a **standalone Go WebSocket server** for real-time seat holds.

## Architecture

| Concern | Technology |
|---|---|
| Web app | Next.js 16 (App Router, server components) |
| Auth | NextAuth v5 — credentials + Google OAuth |
| Database | PostgreSQL via Prisma |
| Payments | In-app credit balance, `$transaction` atomic settlement |
| Real-time seats | Go WebSocket server (`server-go/`) |
| PDF tickets | `@react-pdf/renderer` |
| Email | Nodemailer |

The Go server owns **only** the real-time layer: WebSocket connections, per-seat in-memory holds with a 60-second TTL auto-release, and room broadcasts. When a user confirms a booking, Go calls a Next.js internal API route (protected by `X-Internal-Secret`) that runs the Prisma `$transaction` — debiting the buyer and crediting both the movie vendor and theatre vendor by commission split — then Go broadcasts `seat:booked` to the room.

## Getting Started

### 1. Environment variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Go WebSocket server
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
NEXTJS_URL=http://localhost:3000
WS_INTERNAL_SECRET=some-long-random-secret
```

### 2. Start the Next.js app

```bash
npm install
npm run dev
```

### 3. Start the Go WebSocket server

```bash
cd server-go
go mod tidy
go run main.go
```

The Go server listens on `:4000` by default. Set `PORT`, `NEXTJS_URL`, and `WS_INTERNAL_SECRET` environment variables to override.

## Roles

| Role | Can do |
|---|---|
| `user` | Browse events, book tickets, cancel, download PDF |
| `vendor` | All user actions + create movies/theatres/concerts/trains |
| `admin` | All actions + user management (suspend/unsuspend/delete), stats dashboard |

## Project Structure

```
src/
  app/
    (main)/         # Browse: home, movie/concert/train detail pages
    account/        # Profile, booking history, ticket cancellation
    admin/          # Admin panel (stats + user management)
    auth/           # Login / register
    booking/        # Seat selection (movie/concert) + train booking
    createForm/     # Vendor forms: create movie, theatre, concert, train
    api/            # All API routes
  components/
    ui/             # SimpleCarousel, shared UI
  lib/
    email/          # Nodemailer + PDF ticket generation
    main/           # Server-side data fetching (getData.ts)
server-go/          # Go WebSocket server (main.go)
```
