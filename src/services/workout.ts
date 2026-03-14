import { prisma } from "@/lib/prisma";
import { SOLO_USER_ID } from "@/lib/constants";
import type { PlannedWorkout, WorkoutLog, LogWorkoutInput } from "@/lib/types";

export async function getNextWorkout(): Promise<PlannedWorkout | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.plannedWorkout.findFirst({
    where: {
      userId: SOLO_USER_ID,
      scheduledDate: { gte: today },
      logId: null,
      isDayOff: false,
    },
    orderBy: [{ scheduledDate: "asc" }, { sortOrder: "asc" }],
  });
}

export async function getTodayWorkouts(): Promise<PlannedWorkout[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.plannedWorkout.findMany({
    where: {
      userId: SOLO_USER_ID,
      scheduledDate: { gte: today, lt: tomorrow },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function logWorkout(input: LogWorkoutInput): Promise<WorkoutLog> {
  return prisma.workoutLog.create({
    data: {
      ...input,
      userId: SOLO_USER_ID,
    },
  });
}

export async function completePlannedWorkout(
  plannedWorkoutId: string,
  input: LogWorkoutInput
): Promise<{ log: WorkoutLog; planned: PlannedWorkout }> {
  const log = await prisma.workoutLog.create({
    data: {
      ...input,
      userId: SOLO_USER_ID,
      plannedWorkoutId,
    },
  });

  const planned = await prisma.plannedWorkout.update({
    where: { id: plannedWorkoutId },
    data: {
      logId: log.id,
    },
  });

  return { log, planned };
}

export async function getWorkoutHistory(filters?: {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<WorkoutLog[]> {
  return prisma.workoutLog.findMany({
    where: {
      userId: SOLO_USER_ID,
      ...(filters?.startDate || filters?.endDate
        ? {
            startedAt: {
              ...(filters.startDate ? { gte: filters.startDate } : {}),
              ...(filters.endDate ? { lte: filters.endDate } : {}),
            },
          }
        : {}),
    },
    orderBy: { startedAt: "desc" },
    take: filters?.limit ?? 50,
    skip: filters?.offset ?? 0,
  });
}

/** Snaps a date back to the Sunday of its week (exported for testing). */
export function weekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // getDay() 0=Sun, subtracting gives Sunday
  return d;
}

/**
 * Returns the next `limit` planned workouts that are scheduled strictly
 * after today, excluding day-offs.
 */
export async function getUpcomingWorkouts(
  limit = 3
): Promise<PlannedWorkout[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.plannedWorkout.findMany({
    where: {
      userId: SOLO_USER_ID,
      scheduledDate: { gte: tomorrow },
      isDayOff: false,
    },
    orderBy: [{ scheduledDate: "asc" }, { sortOrder: "asc" }],
    take: limit,
  });
}

/**
 * Returns all planned workouts for the Sun–Sat week containing `weekOf`.
 * Includes logId so the UI can determine completion status.
 */
export async function getWeekWorkouts(weekOf: Date): Promise<PlannedWorkout[]> {
  const start = weekStart(weekOf);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return prisma.plannedWorkout.findMany({
    where: {
      userId: SOLO_USER_ID,
      scheduledDate: { gte: start, lt: end },
    },
    orderBy: [{ scheduledDate: "asc" }, { sortOrder: "asc" }],
  });
}
