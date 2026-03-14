/**
 * seed-dev.ts — Populates the solo user with realistic triathlon training data.
 * Safe to re-run: clears existing plan/workout data for the solo user first.
 *
 * Run: npx tsx prisma/seed-dev.ts
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SOLO_USER_ID = "cld_solo_user_placeholder";

// Today = March 14, 2026 (Saturday) — keep dates relative to "now" so
// the home screen always shows a sensible current week.
function daysFromToday(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

// Monday of this week
function thisMonday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function monday(offset: number): Date {
  const d = thisMonday();
  d.setDate(d.getDate() + offset);
  return d;
}

async function main() {
  console.log("🧹  Clearing existing dev data for solo user...");

  // Order matters — FK constraints
  await prisma.workoutSet.deleteMany({
    where: { log: { userId: SOLO_USER_ID } },
  });
  await prisma.workoutLog.deleteMany({ where: { userId: SOLO_USER_ID } });
  await prisma.plannedWorkout.deleteMany({ where: { userId: SOLO_USER_ID } });
  await prisma.planBreak.deleteMany({ where: { userId: SOLO_USER_ID } });
  await prisma.plan.deleteMany({ where: { userId: SOLO_USER_ID } });

  console.log("👤  Updating solo user name...");
  await prisma.user.update({
    where: { id: SOLO_USER_ID },
    data: { name: "Test Athlete" },
  });

  // ── Plan ──────────────────────────────────────────────────────────────────
  console.log("📋  Creating plan...");

  const planStart = monday(-21); // 3 weeks ago
  const planEnd   = new Date(planStart);
  planEnd.setDate(planEnd.getDate() + 7 * 16); // 16 weeks total
  const raceDate  = new Date(planEnd);

  const plan = await prisma.plan.create({
    data: {
      userId:          SOLO_USER_ID,
      name:            "Olympic Tri — Summer 2026",
      mode:            "AUTO",
      startDate:       planStart,
      endDate:         planEnd,
      raceDate:        raceDate,
      raceName:        "Lake Placid Olympic Triathlon",
      weeklyGoalHours: 8,
      currentSwimPace: 105,  // 1:45/100m
      currentBikeFTP:  220,  // watts
      currentRunPace:  330,  // 5:30/km
      goalSwimPace:    95,   // 1:35/100m
      goalBikeFTP:     250,
      goalRunPace:     300,  // 5:00/km
    },
  });

  await prisma.user.update({
    where: { id: SOLO_USER_ID },
    data: { activePlanId: plan.id },
  });

  // ── This week's planned workouts ──────────────────────────────────────────
  // Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5 (today), Sun=6
  console.log("📅  Creating this week's workouts...");

  const mon = monday(0);   // this Monday
  const tue = monday(1);
  const wed = monday(2);
  const thu = monday(3);
  const fri = monday(4);
  const sat = monday(5);   // today
  const sun = monday(6);

  const [
    swimMon, bikeTue, runWed, restThu, swimFri,
    bikeSat, runSat, restSun,
  ] = await Promise.all([
    // Monday — Swim Endurance
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: mon, type: "SWIM", goal: "ENDURANCE",
      title: "Easy Endurance Swim",
      description: "Long aerobic swim. Keep HR in Z2. Focus on bilateral breathing.",
      targetDuration: 45 * 60, targetDistance: 2000, targetPace: 135,
      sortOrder: 0, isDayOff: false,
    }}),
    // Tuesday — Bike Tempo
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: tue, type: "BIKE", goal: "TEMPO",
      title: "Bike Tempo Intervals",
      description: "3x12min at FTP with 4min recovery. Warm up 15min, cool down 10min.",
      targetDuration: 90 * 60, targetDistance: 40000, targetPower: 220,
      sortOrder: 0, isDayOff: false,
    }}),
    // Wednesday — Run Intervals
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: wed, type: "RUN", goal: "INTERVALS",
      title: "Track Intervals",
      description: "6x800m at 5K pace with 90s rest. Warm up 10min easy.",
      targetDuration: 45 * 60, targetDistance: 8000, targetPace: 285,
      sortOrder: 0, isDayOff: false,
    }}),
    // Thursday — Rest
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: thu, type: "REST",
      title: "Rest Day",
      sortOrder: 0, isDayOff: true,
    }}),
    // Friday — Swim Technique
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: fri, type: "SWIM", goal: "TECHNIQUE",
      title: "Technique & Drills",
      description: "Drill sets: catch-up, fingertip drag, side kick. 200m cool down.",
      targetDuration: 35 * 60, targetDistance: 1500, targetPace: 140,
      sortOrder: 0, isDayOff: false,
    }}),
    // Saturday (TODAY) — BRICK: Bike then Run
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: sat, type: "BIKE", goal: "RACE_PACE",
      title: "Brick Bike",
      description: "Race-pace bike effort. Hold just below FTP. Quick T2 transition.",
      targetDuration: 75 * 60, targetDistance: 32000, targetPower: 210,
      sortOrder: 0, isDayOff: false,
    }}),
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: sat, type: "RUN", goal: "RACE_PACE",
      title: "Brick Run",
      description: "Off the bike. First 5min will feel rough — hold pace anyway.",
      targetDuration: 25 * 60, targetDistance: 5000, targetPace: 310,
      sortOrder: 1, isDayOff: false,
    }}),
    // Sunday — Rest
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: sun, type: "REST",
      title: "Rest Day",
      sortOrder: 0, isDayOff: true,
    }}),
  ]);

  // ── Logs for completed past workouts ─────────────────────────────────────
  console.log("✅  Logging completed workouts...");

  // Monday swim — completed
  const logSwimMon = await prisma.workoutLog.create({ data: {
    userId: SOLO_USER_ID, plannedWorkoutId: swimMon.id,
    type: "SWIM", goal: "ENDURANCE",
    title: "Easy Endurance Swim",
    startedAt: new Date(mon.getTime() + 7 * 3600_000), // 7am
    duration: 44 * 60, distance: 1950,
    avgPace: 135, avgHeartRate: 138, maxHeartRate: 152, calories: 420,
    perceivedEffort: 5,
  }});
  await prisma.plannedWorkout.update({
    where: { id: swimMon.id }, data: { logId: logSwimMon.id },
  });

  // Tuesday bike — MISSED (no log, no logId update)

  // Wednesday run — completed
  const logRunWed = await prisma.workoutLog.create({ data: {
    userId: SOLO_USER_ID, plannedWorkoutId: runWed.id,
    type: "RUN", goal: "INTERVALS",
    title: "Track Intervals",
    startedAt: new Date(wed.getTime() + 6.5 * 3600_000), // 6:30am
    duration: 47 * 60, distance: 8200,
    avgPace: 345, avgHeartRate: 165, maxHeartRate: 181, calories: 580,
    perceivedEffort: 8,
    notes: "Legs felt heavy first two reps then opened up. Hit splits on 4/6.",
  }});
  await prisma.plannedWorkout.update({
    where: { id: runWed.id }, data: { logId: logRunWed.id },
  });

  // Friday swim — completed
  const logSwimFri = await prisma.workoutLog.create({ data: {
    userId: SOLO_USER_ID, plannedWorkoutId: swimFri.id,
    type: "SWIM", goal: "TECHNIQUE",
    title: "Technique & Drills",
    startedAt: new Date(fri.getTime() + 6 * 3600_000), // 6am
    duration: 37 * 60, distance: 1600,
    avgPace: 138, avgHeartRate: 128, maxHeartRate: 141, calories: 310,
    perceivedEffort: 4,
    notes: "Catch-up drill really helped rotation. Felt smoother by end.",
  }});
  await prisma.plannedWorkout.update({
    where: { id: swimFri.id }, data: { logId: logSwimFri.id },
  });

  // ── Next week's planned workouts ─────────────────────────────────────────
  console.log("📅  Creating next week's workouts...");

  const nextMon = monday(7);
  const nextTue = monday(8);
  const nextWed = monday(9);
  const nextThu = monday(10);
  const nextSat = monday(12);
  const nextSun = monday(13);

  await Promise.all([
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: nextMon, type: "SWIM", goal: "ENDURANCE",
      title: "Long Swim",
      description: "Build to 2200m. Negative split — second half faster than first.",
      targetDuration: 50 * 60, targetDistance: 2200, targetPace: 136,
      sortOrder: 0, isDayOff: false,
    }}),
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: nextTue, type: "BIKE", goal: "ENDURANCE",
      title: "Long Ride",
      description: "Steady aerobic ride. 80% Z2, 20% Z3 on climbs.",
      targetDuration: 120 * 60, targetDistance: 50000, targetPower: 190,
      sortOrder: 0, isDayOff: false,
    }}),
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: nextWed, type: "RUN", goal: "TEMPO",
      title: "Tempo Run",
      description: "2x20min at threshold pace with 5min jog recovery.",
      targetDuration: 55 * 60, targetDistance: 10000, targetPace: 305,
      sortOrder: 0, isDayOff: false,
    }}),
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: nextThu, type: "STRENGTH", goal: "FREE",
      title: "Strength & Core",
      description: "Hip stability, single-leg work, core circuits. No heavy lifting.",
      targetDuration: 45 * 60,
      sortOrder: 0, isDayOff: false,
    }}),
    // Friday rest
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: monday(11), type: "REST",
      title: "Rest Day",
      sortOrder: 0, isDayOff: true,
    }}),
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: nextSat, type: "RUN", goal: "ENDURANCE",
      title: "Long Run",
      description: "Easy long run. Conversational pace throughout.",
      targetDuration: 90 * 60, targetDistance: 18000, targetPace: 340,
      sortOrder: 0, isDayOff: false,
    }}),
    prisma.plannedWorkout.create({ data: {
      planId: plan.id, userId: SOLO_USER_ID,
      scheduledDate: nextSun, type: "SWIM", goal: "OPEN_WATER",
      title: "Open Water Sim",
      description: "Sighting drills, buoy turns, drafting practice.",
      targetDuration: 45 * 60, targetDistance: 2000, targetPace: 135,
      sortOrder: 0, isDayOff: false,
    }}),
  ]);

  console.log("🎉  Done! Solo user now has:");
  console.log("    • Plan: Olympic Tri — Summer 2026");
  console.log("    • This week: Mon(swim✓), Tue(bike✗), Wed(run✓), Thu(rest), Fri(swim✓), Sat(brick today), Sun(rest)");
  console.log("    • Next week: 6 upcoming workouts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
