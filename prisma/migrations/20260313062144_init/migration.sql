-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('SWIM', 'BIKE', 'RUN', 'BRICK', 'STRENGTH', 'REST', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkoutGoal" AS ENUM ('ENDURANCE', 'TEMPO', 'INTERVALS', 'RECOVERY', 'RACE_PACE', 'OPEN_WATER', 'TECHNIQUE', 'FREE');

-- CreateEnum
CREATE TYPE "BreakType" AS ENUM ('VACATION', 'ILLNESS', 'INJURY', 'PERSONAL', 'TAPER', 'OTHER');

-- CreateEnum
CREATE TYPE "BreakAdjustmentStrategy" AS ENUM ('PUSH_FORWARD', 'SKIP_DAYS', 'MANUAL');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE');

-- CreateEnum
CREATE TYPE "PlanMode" AS ENUM ('AUTO', 'MANUAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "IntensityZone" AS ENUM ('Z1_RECOVERY', 'Z2_ENDURANCE', 'Z3_TEMPO', 'Z4_THRESHOLD', 'Z5_MAX');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
    "preferredDistUnit" TEXT NOT NULL DEFAULT 'km',
    "preferredPaceUnit" TEXT NOT NULL DEFAULT 'min/km',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "activePlanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "PlanMode" NOT NULL DEFAULT 'AUTO',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "raceDate" TIMESTAMP(3),
    "raceName" TEXT,
    "weeklyGoalHours" DOUBLE PRECISION,
    "currentSwimPace" INTEGER,
    "currentBikeFTP" INTEGER,
    "currentRunPace" INTEGER,
    "goalSwimPace" INTEGER,
    "goalBikeFTP" INTEGER,
    "goalRunPace" INTEGER,
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedWorkout" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "type" "WorkoutType" NOT NULL,
    "goal" "WorkoutGoal",
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDuration" INTEGER,
    "targetDistance" INTEGER,
    "targetPace" INTEGER,
    "targetPower" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDayOff" BOOLEAN NOT NULL DEFAULT false,
    "logId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannedWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plannedWorkoutId" TEXT,
    "type" "WorkoutType" NOT NULL,
    "goal" "WorkoutGoal",
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "distance" INTEGER,
    "avgPace" INTEGER,
    "avgPower" INTEGER,
    "avgHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "calories" INTEGER,
    "perceivedEffort" INTEGER,
    "intensityZone" "IntensityZone",
    "feelRating" INTEGER,
    "externalSource" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSet" (
    "id" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "label" TEXT,
    "distance" INTEGER,
    "duration" INTEGER,
    "pace" INTEGER,
    "power" INTEGER,
    "heartRate" INTEGER,
    "zone" "IntensityZone",
    "isRest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanBreak" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "BreakType" NOT NULL,
    "adjustmentStrategy" "BreakAdjustmentStrategy" NOT NULL DEFAULT 'SKIP_DAYS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanBreak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PlannedWorkout_logId_key" ON "PlannedWorkout"("logId");

-- CreateIndex
CREATE INDEX "PlannedWorkout_userId_scheduledDate_idx" ON "PlannedWorkout"("userId", "scheduledDate");

-- CreateIndex
CREATE INDEX "WorkoutLog_userId_startedAt_idx" ON "WorkoutLog"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedWorkout" ADD CONSTRAINT "PlannedWorkout_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedWorkout" ADD CONSTRAINT "PlannedWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedWorkout" ADD CONSTRAINT "PlannedWorkout_logId_fkey" FOREIGN KEY ("logId") REFERENCES "WorkoutLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_plannedWorkoutId_fkey" FOREIGN KEY ("plannedWorkoutId") REFERENCES "PlannedWorkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSet" ADD CONSTRAINT "WorkoutSet_logId_fkey" FOREIGN KEY ("logId") REFERENCES "WorkoutLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanBreak" ADD CONSTRAINT "PlanBreak_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanBreak" ADD CONSTRAINT "PlanBreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
