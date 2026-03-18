# Brick

A training app for triathletes. Plan your season, log your workouts, and track progress across swim, bike, and run — all in one place.

Built as a personal project by a triathlete who got tired of juggling spreadsheets and three different apps.

---

## What it does

- **Training plans** — build a structured plan around your race date, with periodized phases (base, build, peak, taper) generated from real coaching principles
- **Workout logging** — log swims, rides, runs, strength sessions, and brick workouts with fields that make sense for each sport
- **Home dashboard** — see today's workouts, upcoming sessions, and a week-at-a-glance overview
- **Plan vs. actual** — compare what you planned against what you actually did
- **Stats** — calendar history and aggregate breakdowns by sport

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 6 |
| Database | PostgreSQL (Supabase) |
| Deployment | Vercel |

---

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Supabase)

### Setup

```bash
# Clone the repo
git clone git@github.com:marthalyndon/brick.git
cd brick

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL

# Run migrations and seed the database
npx prisma migrate dev
npx prisma db seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
src/
├── app/              # Next.js App Router pages and layouts
│   └── (app)/        # Home, Plan, Stats, History pages
├── components/       # UI components (workout cards, nav, icons)
│   ├── icons/
│   ├── nav/
│   ├── ui/
│   └── workout/
├── services/         # Service layer — all database access goes here
└── lib/              # Utilities, types, constants
```

---

## Data model

Six core tables: `User`, `Plan`, `PlannedWorkout`, `WorkoutLog`, `WorkoutSet`, `PlanBreak`.

All distances are stored in **meters**. All paces are stored in **seconds**. Unit conversion happens at display time only.

---

## Auth

Auth is deferred for MVP. The app runs as a single-user instance using a seeded `SOLO_USER_ID` constant. The schema is already designed for multi-user — adding NextAuth later requires no schema changes.

---

## Status

Active development. Data model, service layer, and Home screen UI are complete. Plan, Stats, and History screens are in progress.

---

## License

Personal project — not open for contributions at this time.
