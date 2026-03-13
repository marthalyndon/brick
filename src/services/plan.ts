import { prisma } from "@/lib/prisma";
import { SOLO_USER_ID } from "@/lib/constants";
import { generatePlan } from "@/lib/generatePlan";
import type { Plan, PlannedWorkout, CreatePlanInput, GeneratePlanInput, RaceDistance } from "@/lib/types";

/**
 * Returns the active plan for the solo user, plus the next two weeks of planned workouts.
 */
export async function getActivePlan(): Promise<{
  plan: Plan | null;
  upcomingWorkouts: PlannedWorkout[];
}> {
  const user = await prisma.user.findUnique({
    where: { id: SOLO_USER_ID },
    select: { activePlanId: true },
  });

  if (!user?.activePlanId) return { plan: null, upcomingWorkouts: [] };

  const plan = await prisma.plan.findUnique({
    where: { id: user.activePlanId },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingWorkouts = await prisma.plannedWorkout.findMany({
    where: {
      planId: user.activePlanId,
      userId: SOLO_USER_ID,
      scheduledDate: { gte: today },
    },
    orderBy: [{ scheduledDate: "asc" }, { sortOrder: "asc" }],
    take: 14,
  });

  return { plan, upcomingWorkouts };
}

/**
 * Returns all planned workouts for a plan within a date range.
 */
export async function getPlanCalendar(
  planId: string,
  startDate: Date,
  endDate: Date
): Promise<PlannedWorkout[]> {
  return prisma.plannedWorkout.findMany({
    where: {
      planId,
      userId: SOLO_USER_ID,
      scheduledDate: { gte: startDate, lte: endDate },
    },
    orderBy: [{ scheduledDate: "asc" }, { sortOrder: "asc" }],
  });
}

/**
 * Creates a new plan and, if mode is AUTO, generates and persists all planned workouts.
 */
export async function createPlan(input: CreatePlanInput & {
  raceDistance?: RaceDistance;
}): Promise<Plan> {
  const { raceDistance, experienceLevel: _experienceLevel, ...planData } = input;

  const plan = await prisma.plan.create({
    data: {
      ...planData,
      userId: SOLO_USER_ID,
      mode: planData.mode ?? "AUTO",
    },
  });

  await prisma.user.update({
    where: { id: SOLO_USER_ID },
    data: { activePlanId: plan.id },
  });

  if (plan.mode === "AUTO" && plan.raceDate && raceDistance) {
    const user = await prisma.user.findUnique({ where: { id: SOLO_USER_ID } });
    const genInput: GeneratePlanInput = {
      userId: SOLO_USER_ID,
      planId: plan.id,
      startDate: plan.startDate,
      raceDate: plan.raceDate,
      raceDistance,
      experienceLevel: user?.experienceLevel ?? "INTERMEDIATE",
      weeklyGoalHours: plan.weeklyGoalHours ?? 6,
      currentSwimPace: plan.currentSwimPace ?? undefined,
      currentBikeFTP: plan.currentBikeFTP ?? undefined,
      currentRunPace: plan.currentRunPace ?? undefined,
    };

    const generated = generatePlan(genInput);
    await prisma.plannedWorkout.createMany({
      data: generated.map((w) => ({
        planId: plan.id,
        userId: SOLO_USER_ID,
        scheduledDate: w.scheduledDate,
        type: w.type,
        goal: w.goal,
        title: w.title,
        description: w.description,
        targetDuration: w.targetDuration,
        targetDistance: w.targetDistance,
        targetPace: w.targetPace,
        targetPower: w.targetPower,
        sortOrder: w.sortOrder,
        isDayOff: w.isDayOff,
      })),
    });
  }

  return plan;
}

/**
 * Updates plan metadata (not workouts).
 */
export async function updatePlan(
  planId: string,
  updates: Partial<CreatePlanInput>
): Promise<Plan> {
  return prisma.plan.update({
    where: { id: planId },
    data: updates,
  });
}
