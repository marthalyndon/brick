# Brick — Triathlon Training App
> Claude Code project briefing. Read this before doing anything in this codebase.

---

## What This App Is

**Brick** is a web-based triathlon training app. It helps an athlete create structured training plans, view upcoming workouts, log completed sessions, and expose all data to an MCP server for AI-assisted coaching.

**Stack:** Next.js (full-stack, App Router), PostgreSQL, Prisma ORM, TypeScript, Tailwind CSS  
**Auth:** NextAuth — DEFERRED. Not wired up yet. See Solo Phase below.  
**Status:** Scaffold complete. Prisma schema + seed next.

---

## Current Build Order

1. ✅ Data model designed
2. ✅ Next.js project scaffolded
3. ✅ Prisma schema file + seed script (solo user)
4. ✅ Figma library complete → component library
5. ⬜ MCP tool definitions
6. ⬜ Auth (NextAuth) — post-MVP

---

## Solo / Pre-Auth Phase (IMPORTANT)

Auth is deferred. There is one hardcoded user seeded at migration time.

```ts
// lib/constants.ts
export const SOLO_USER_ID = "cld_solo_user_placeholder";
```

- All service layer functions use `SOLO_USER_ID` — never derive from session
- When auth is added later: swap `SOLO_USER_ID` for `session.user.id`, wire NextAuth, enable RLS
- **Schema is already multi-user ready — do not change it**

### What to skip for now
- NextAuth, session middleware, protected routes
- Row-level security (RLS) in Postgres
- Multi-user data isolation
- Account settings UI

---

## App Pages

### Home
- Next upcoming workout at top (icon, sport type, goal, quick-log button)
- Rest of the week below (color-coded overview)
- Weekly goal indicator

### Plan
- Calendar view of upcoming workouts (Google Calendar-style)
- Mark workouts done inline
- Create a plan flow: name, race date, end date, experience level, current + goal paces
- Edit plan: swap/move/add/remove days; bulk add vacation/sick/injury days

### Stats
- Calendar history of completed workouts
- Plan vs. actual per workout
- Aggregate stats by sport (swim / bike / run)

---

## Plan Auto-Generation

Generation logic lives in one isolated function — keep it this way:

```ts
generatePlan(input) → PlannedWorkout[]
```

This allows swapping hardcoded periodization rules for AI generation later with zero schema changes.

**Periodization pattern:**
- Weeks 1–3: build volume ~10%/week
- Week 4: recovery week (~60% of peak volume)
- Repeat
- Final 1–2 weeks: taper before race date

---

## Data Model

### Enums

| Enum | Values |
|------|--------|
| `WorkoutType` | SWIM, BIKE, RUN, BRICK, STRENGTH, REST, OTHER |
| `WorkoutGoal` | ENDURANCE, TEMPO, INTERVALS, RECOVERY, RACE_PACE, OPEN_WATER, TECHNIQUE, FREE |
| `BreakType` | VACATION, ILLNESS, INJURY, PERSONAL, TAPER, OTHER |
| `BreakAdjustmentStrategy` | PUSH_FORWARD, SKIP_DAYS, MANUAL |
| `ExperienceLevel` | BEGINNER, INTERMEDIATE, ADVANCED, ELITE |
| `PlanMode` | AUTO, MANUAL, HYBRID |

### Tables

**User** — id, email, name, avatarUrl, experienceLevel, preferredDistUnit, preferredPaceUnit, timezone, activePlanId, createdAt, updatedAt

**Plan** — id, userId, name, mode, startDate, endDate, raceDate, raceName, weeklyGoalHours, notes, currentSwimPace, currentBikeFTP, currentRunPace, goalSwimPace, goalBikeFTP, goalRunPace, archivedAt, createdAt, updatedAt

**PlannedWorkout** — id, planId, userId, scheduledDate, type, goal, title, description, targetDuration, targetDistance, targetPace, targetPower, sortOrder, isDayOff, logId, createdAt, updatedAt
> BRICK workouts = two PlannedWorkouts on same date (BIKE + RUN) with sortOrder 0 and 1

**WorkoutLog** — id, userId, plannedWorkoutId, type, goal, title, notes, startedAt, duration, distance, avgPace, avgPower, avgHeartRate, maxHeartRate, calories, perceivedEffort, externalSource, externalId, createdAt, updatedAt

**WorkoutSet** — id, logId, setNumber, label, distance, duration, pace, power, heartRate, isRest, createdAt

**PlanBreak** — id, planId, userId, startDate, endDate, type, adjustmentStrategy, notes, createdAt, updatedAt

### Key Rules
- All distances stored in **meters**, all paces in **seconds** — convert to user's preferred unit at display time only
- Composite indexes: `(userId, scheduledDate)` on PlannedWorkout; `(userId, startedAt)` on WorkoutLog
- Use `cuid()` or `uuid()` for all primary keys

---

## MCP Exposure Strategy

MCP tools call the app's **service layer only** — never raw DB. All writes validated through service layer first.

### Plan Tools
- `getActivePlan(userId)` → Plan + next 7 PlannedWorkouts
- `getPlanCalendar(planId, startDate, endDate)` → PlannedWorkout[]
- `createPlan(userId, planInput)` → Plan
- `updatePlan(planId, updates)` → Plan

### Workout Tools
- `getNextWorkout(userId)` → PlannedWorkout + Plan context
- `getTodayWorkouts(userId)` → PlannedWorkout[]
- `logWorkout(userId, logInput)` → WorkoutLog
- `completePlannedWorkout(plannedWorkoutId, logInput)` → WorkoutLog + updated PlannedWorkout
- `getWorkoutHistory(userId, filters)` → WorkoutLog[] (paginated)

### Stats Tools
- `getWeeklyStats(userId, weekOf)` → `{ totalDuration, totalDistance, byType }`
- `getTrainingLoad(userId, weeks)` → weekly volume array for charting
- `getPlanVsActual(planId)` → `{ planned, completed, skipped }` per workout

---

## Design System

- Designs come from Figma via Figma MCP — always check Figma before building UI
- Design tokens (colors, spacing, type) come from the Figma library
- Mobile-first. Breakpoints: Mobile (primary), iPad landscape, Desktop (full support)
- Fill gaps (empty states, secondary screens, responsive variants) using patterns from the imported Figma library

---

## Periodization Reference (for generatePlan)

| Race Distance | Swim | Bike | Run |
|---|---|---|---|
| SPRINT | 750m | 20km | 5km |
| OLYMPIC | 1,500m | 40km | 10km |
| HALF (70.3) | 1,900m | 90km | 21.1km |
| FULL (Ironman) | 3,800m | 180km | 42.2km |

**Phase order (always work backwards from race date):**
PREP → BASE → BUILD → PEAK → TAPER → RACE

**Taper duration by distance:**
- Sprint: 1 week | Olympic: 1.5 weeks | Half: 2 weeks | Full: 3 weeks

**Volume rules:**
- Max weekly volume increase: 10%
- Recovery week drop: ~35% from peak
- Mesocycle: 3:1 (beginner/intermediate), 4:1 (advanced)
- Intensity: ≥80% Z1–Z2 at all times (80/20 rule)
- Taper = cut VOLUME not intensity

**Sport time distribution [swim, bike, run]:**
- Sprint: 20% / 50% / 30%
- Olympic: 22% / 48% / 30%
- Half: 18% / 52% / 30%
- Full: 13% / 57% / 30%

---

## Coding Conventions

- TypeScript everywhere — no `any`
- App Router only (no Pages Router)
- Server components by default; use `"use client"` only when needed
- Service layer handles all DB access — components never query Prisma directly
- Keep `generatePlan()` isolated and swappable
- Tailwind for all styling — no CSS modules or inline styles
