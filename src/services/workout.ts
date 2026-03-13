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
      completedAt: null,
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
      completedAt: new Date(),
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
