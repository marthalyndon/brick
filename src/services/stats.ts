import { prisma } from "@/lib/prisma";
import { SOLO_USER_ID } from "@/lib/constants";
import type { WeeklyStats, WorkoutType } from "@/lib/types";

export async function getWeeklyStats(weekOf: Date): Promise<WeeklyStats> {
  const start = new Date(weekOf);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // snap to Monday

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const logs = await prisma.workoutLog.findMany({
    where: {
      userId: SOLO_USER_ID,
      startedAt: { gte: start, lt: end },
    },
  });

  const byType = {} as Record<WorkoutType, { duration: number; distance: number }>;
  let totalDuration = 0;
  let totalDistance = 0;

  for (const log of logs) {
    const type = log.type as WorkoutType;
    if (!byType[type]) byType[type] = { duration: 0, distance: 0 };
    byType[type].duration += log.duration ?? 0;
    byType[type].distance += log.distance ?? 0;
    totalDuration += log.duration ?? 0;
    totalDistance += log.distance ?? 0;
  }

  return { totalDuration, totalDistance, byType };
}

export async function getTrainingLoad(
  weeks: number = 12
): Promise<{ weekOf: Date; totalSeconds: number }[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - weeks * 7);

  const logs = await prisma.workoutLog.findMany({
    where: {
      userId: SOLO_USER_ID,
      startedAt: { gte: start, lte: end },
    },
    select: { startedAt: true, duration: true },
  });

  const weekMap = new Map<string, number>();
  for (const log of logs) {
    const d = new Date(log.startedAt);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // snap to Monday
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString();
    weekMap.set(key, (weekMap.get(key) ?? 0) + (log.duration ?? 0));
  }

  return [...weekMap.entries()]
    .map(([key, totalSeconds]) => ({ weekOf: new Date(key), totalSeconds }))
    .sort((a, b) => a.weekOf.getTime() - b.weekOf.getTime());
}

export async function getPlanVsActual(planId: string): Promise<{
  planned: number;
  completed: number;
  skipped: number;
}> {
  const all = await prisma.plannedWorkout.findMany({
    where: { planId, userId: SOLO_USER_ID, isDayOff: false },
  });

  const today = new Date();
  const past = all.filter((w) => w.scheduledDate <= today);

  return {
    planned: past.length,
    completed: past.filter((w) => w.completedAt !== null).length,
    skipped: past.filter((w) => w.completedAt === null).length,
  };
}
