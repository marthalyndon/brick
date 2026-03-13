import type {
  User,
  Plan,
  PlannedWorkout,
  WorkoutLog,
  WorkoutSet,
  PlanBreak,
  WorkoutType,
  WorkoutGoal,
  ExperienceLevel,
  PlanMode,
  IntensityZone,
  BreakType,
  BreakAdjustmentStrategy,
} from "@/generated/prisma/client";

// Re-export Prisma types for use across the app
export type {
  User,
  Plan,
  PlannedWorkout,
  WorkoutLog,
  WorkoutSet,
  PlanBreak,
  WorkoutType,
  WorkoutGoal,
  ExperienceLevel,
  PlanMode,
  IntensityZone,
  BreakType,
  BreakAdjustmentStrategy,
};

// ─── Service Input Types ───────────────────────────────────────────────────────

export type CreatePlanInput = {
  name: string;
  mode?: PlanMode;
  startDate: Date;
  endDate: Date;
  raceDate?: Date;
  raceName?: string;
  weeklyGoalHours?: number;
  experienceLevel?: ExperienceLevel;
  currentSwimPace?: number;
  currentBikeFTP?: number;
  currentRunPace?: number;
  goalSwimPace?: number;
  goalBikeFTP?: number;
  goalRunPace?: number;
  notes?: string;
};

export type LogWorkoutInput = {
  plannedWorkoutId?: string;
  type: WorkoutType;
  goal?: WorkoutGoal;
  title: string;
  notes?: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  distance?: number;
  avgPace?: number;
  avgPower?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  calories?: number;
  perceivedEffort?: number;
  intensityZone?: IntensityZone;
  feelRating?: number;
};

export type WeeklyStats = {
  totalDuration: number;   // seconds
  totalDistance: number;   // meters
  byType: Record<WorkoutType, { duration: number; distance: number }>;
};

// ─── generatePlan Types ────────────────────────────────────────────────────────

export type RaceDistance = "SPRINT" | "OLYMPIC" | "HALF" | "FULL";

export type GeneratePlanInput = {
  userId: string;
  planId: string;
  startDate: Date;
  raceDate: Date;
  raceDistance: RaceDistance;
  experienceLevel: ExperienceLevel;
  weeklyGoalHours: number;
  currentSwimPace?: number;   // sec/100m
  currentBikeFTP?: number;    // watts
  currentRunPace?: number;    // sec/km
};

export type GeneratedWorkout = {
  scheduledDate: Date;
  type: WorkoutType;
  goal: WorkoutGoal;
  title: string;
  description?: string;
  targetDuration?: number;   // seconds
  targetDistance?: number;   // meters
  targetPace?: number;
  targetPower?: number;
  sortOrder: number;
  isDayOff: boolean;
};
