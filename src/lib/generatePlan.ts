import type {
  GeneratePlanInput,
  GeneratedWorkout,
  RaceDistance,
} from "./types";
import type { ExperienceLevel, WorkoutGoal, WorkoutType } from "@/generated/prisma";

// ─── Constants ────────────────────────────────────────────────────────────────

const TAPER_WEEKS: Record<RaceDistance, number> = {
  SPRINT: 1,
  OLYMPIC: 2,   // 1.5 rounded to 2
  HALF: 2,
  FULL: 3,
};

// Sport time distribution [swim%, bike%, run%]
const DIST_RATIOS: Record<RaceDistance, [number, number, number]> = {
  SPRINT: [0.20, 0.50, 0.30],
  OLYMPIC: [0.22, 0.48, 0.30],
  HALF: [0.18, 0.52, 0.30],
  FULL: [0.13, 0.57, 0.30],
};

// Mesocycle length (build weeks before recovery week)
const MESO_LENGTH: Record<ExperienceLevel, number> = {
  BEGINNER: 3,
  INTERMEDIATE: 3,
  ADVANCED: 4,
  ELITE: 4,
};

const RECOVERY_FACTOR = 0.65;
const MAX_WEEKLY_INCREASE = 1.10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

function weeksBetween(a: Date, b: Date): number {
  return Math.floor(daysBetween(a, b) / 7);
}

// ─── Weekly Volume Schedule ───────────────────────────────────────────────────

/**
 * Returns total training seconds for each week.
 * Resets baseline after recovery weeks to ensure week-over-week increase ≤ 10%.
 */
function buildVolumeSchedule(
  numWeeks: number,
  baseSecondsPerWeek: number,
  taperWeeks: number,
  mesoLength: number
): number[] {
  const volumes: number[] = [];
  let current = baseSecondsPerWeek;

  for (let w = 0; w < numWeeks; w++) {
    const weeksUntilEnd = numWeeks - w;
    if (weeksUntilEnd <= taperWeeks) {
      // Taper: reduce by ~20% per taper week from peak
      const taperFactor = Math.pow(0.80, taperWeeks - weeksUntilEnd + 1);
      volumes.push(Math.round(current * taperFactor));
    } else {
      const positionInMeso = w % (mesoLength + 1);
      if (positionInMeso === mesoLength) {
        // Recovery week
        const recoveryVolume = Math.round(current * RECOVERY_FACTOR);
        volumes.push(recoveryVolume);
        // Reset baseline: next build week starts 10% above recovery (not back at peak)
        current = Math.round(recoveryVolume * MAX_WEEKLY_INCREASE);
      } else {
        volumes.push(Math.round(current));
        if (positionInMeso < mesoLength - 1) {
          current = Math.round(current * MAX_WEEKLY_INCREASE);
        }
      }
    }
  }

  return volumes;
}

// ─── Day Builder ──────────────────────────────────────────────────────────────

type Segment = { type: WorkoutType; goal: WorkoutGoal; fraction: number };

/** Returns the segment list for a given week day (0=Mon..6=Sun) */
function daySegments(
  dayOfWeek: number,
  weekIndex: number,
  [swimRatio, bikeRatio, runRatio]: [number, number, number]
): Segment[] {
  if (dayOfWeek === 6) return []; // Sunday = rest

  const patterns: Record<number, Segment[]> = {
    0: [{ type: "RUN",  goal: "RECOVERY",  fraction: runRatio  * 0.30 }],
    1: [{ type: "SWIM", goal: "TECHNIQUE", fraction: swimRatio * 0.40 }],
    2: [{ type: "BIKE", goal: "ENDURANCE", fraction: bikeRatio * 0.35 }],
    3: [{ type: "RUN",  goal: "TEMPO",     fraction: runRatio  * 0.35 }],
    4: [{ type: "SWIM", goal: "ENDURANCE", fraction: swimRatio * 0.60 }],
    5: weekIndex % 3 === 2
      ? [
          { type: "BIKE", goal: "RACE_PACE", fraction: bikeRatio * 0.50 },
          { type: "RUN",  goal: "RACE_PACE", fraction: runRatio  * 0.50 },
        ]
      : [{ type: "BIKE", goal: "ENDURANCE", fraction: bikeRatio * 0.65 }],
  };

  return patterns[dayOfWeek] ?? [];
}

function titleFor(type: WorkoutType, goal: WorkoutGoal): string {
  const goalLabels: Record<WorkoutGoal, string> = {
    ENDURANCE: "Endurance", TEMPO: "Tempo", INTERVALS: "Intervals",
    RECOVERY: "Recovery",   RACE_PACE: "Race Pace", OPEN_WATER: "Open Water",
    TECHNIQUE: "Technique", FREE: "Free",
  };
  const typeLabels: Record<WorkoutType, string> = {
    SWIM: "Swim", BIKE: "Bike", RUN: "Run", BRICK: "Brick",
    STRENGTH: "Strength", REST: "Rest", OTHER: "Other",
  };
  return `${goalLabels[goal]} ${typeLabels[type]}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function generatePlan(input: GeneratePlanInput): GeneratedWorkout[] {
  const { startDate, raceDate, raceDistance, experienceLevel, weeklyGoalHours } = input;

  const baseSeconds   = weeklyGoalHours * 3600;
  const totalWeeks    = weeksBetween(startDate, raceDate);
  const taperWeeks    = TAPER_WEEKS[raceDistance];
  const mesoLength    = MESO_LENGTH[experienceLevel];
  const ratios        = DIST_RATIOS[raceDistance];
  const volumeSchedule = buildVolumeSchedule(totalWeeks, baseSeconds, taperWeeks, mesoLength);

  const workouts: GeneratedWorkout[] = [];
  const origin = new Date(startDate);

  for (let week = 0; week < totalWeeks; week++) {
    const weekVolume = volumeSchedule[week] ?? 0;

    // Collect all training segments and rest days for the week
    type WeekEntry = { day: number; date: Date; segment: Segment };
    const trainingEntries: WeekEntry[] = [];
    const restDates: Date[] = [];

    for (let day = 0; day < 7; day++) {
      const date = addDays(origin, week * 7 + day);
      const segs = daySegments(day, week, ratios);
      if (segs.length === 0) {
        restDates.push(date);
      } else {
        for (const seg of segs) {
          trainingEntries.push({ day, date, segment: seg });
        }
      }
    }

    // Distribute weekVolume proportionally so weekly total === weekVolume
    const totalFraction = trainingEntries.reduce((s, e) => s + e.segment.fraction, 0);

    // Group by day to assign sortOrder correctly
    const byDay = new Map<number, WeekEntry[]>();
    for (const entry of trainingEntries) {
      if (!byDay.has(entry.day)) byDay.set(entry.day, []);
      byDay.get(entry.day)!.push(entry);
    }

    for (const [, entries] of byDay) {
      entries.forEach((entry, idx) => {
        const duration = totalFraction > 0
          ? Math.round((entry.segment.fraction / totalFraction) * weekVolume)
          : 0;

        workouts.push({
          scheduledDate: entry.date,
          type: entry.segment.type,
          goal: entry.segment.goal,
          title: titleFor(entry.segment.type, entry.segment.goal),
          targetDuration: duration > 0 ? duration : undefined,
          sortOrder: idx,
          isDayOff: false,
        });
      });
    }

    for (const date of restDates) {
      workouts.push({
        scheduledDate: date,
        type: "REST",
        goal: "RECOVERY",
        title: "Rest Day",
        sortOrder: 0,
        isDayOff: true,
      });
    }
  }

  return workouts;
}
