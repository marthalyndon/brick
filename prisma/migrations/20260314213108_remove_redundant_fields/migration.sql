/*
  Warnings:

  - You are about to drop the column `completedAt` on the `PlannedWorkout` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `feelRating` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `intensityZone` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `zone` on the `WorkoutSet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlannedWorkout" DROP COLUMN "completedAt";

-- AlterTable
ALTER TABLE "WorkoutLog" DROP COLUMN "endedAt",
DROP COLUMN "feelRating",
DROP COLUMN "intensityZone";

-- AlterTable
ALTER TABLE "WorkoutSet" DROP COLUMN "zone";

-- DropEnum
DROP TYPE "IntensityZone";
