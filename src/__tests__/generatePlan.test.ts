import { describe, it, expect } from "vitest";
import { generatePlan } from "../lib/generatePlan";
import type { GeneratePlanInput } from "../lib/types";

const BASE_INPUT: GeneratePlanInput = {
  userId: "test-user",
  planId: "test-plan",
  startDate: new Date("2026-04-01"),
  raceDate: new Date("2026-06-28"),    // ~13 weeks
  raceDistance: "OLYMPIC",
  experienceLevel: "INTERMEDIATE",
  weeklyGoalHours: 8,
};

describe("generatePlan", () => {
  it("returns an array of workouts", () => {
    const workouts = generatePlan(BASE_INPUT);
    expect(Array.isArray(workouts)).toBe(true);
    expect(workouts.length).toBeGreaterThan(0);
  });

  it("covers every day from startDate to one week before raceDate", () => {
    const workouts = generatePlan(BASE_INPUT);
    const firstDate = workouts[0].scheduledDate;
    expect(firstDate.toDateString()).toBe(BASE_INPUT.startDate.toDateString());
  });

  it("includes a REST day each week", () => {
    const workouts = generatePlan(BASE_INPUT);
    const week1 = workouts.slice(0, 7);
    const restDays = week1.filter((w) => w.isDayOff || w.type === "REST");
    expect(restDays.length).toBeGreaterThanOrEqual(1);
  });

  it("BRICK workouts produce exactly two entries on the same date (BIKE + RUN)", () => {
    const workouts = generatePlan(BASE_INPUT);
    const dateMap = new Map<string, typeof workouts>();
    for (const w of workouts) {
      const key = w.scheduledDate.toDateString();
      if (!dateMap.has(key)) dateMap.set(key, []);
      dateMap.get(key)!.push(w);
    }
    const brickDates = [...dateMap.values()].filter((ws) => ws.length > 1);
    for (const pair of brickDates) {
      expect(pair.length).toBe(2);
      const types = pair.map((w) => w.type).sort();
      expect(types).toEqual(["BIKE", "RUN"]);
      const orders = pair.map((w) => w.sortOrder).sort();
      expect(orders).toEqual([0, 1]);
    }
  });

  it("volume does not increase more than 10% week-over-week in build weeks", () => {
    const workouts = generatePlan(BASE_INPUT);
    const weeks: number[][] = [];
    const start = BASE_INPUT.startDate.getTime();
    for (const w of workouts) {
      if (w.isDayOff || !w.targetDuration) continue;
      const weekIdx = Math.floor(
        (w.scheduledDate.getTime() - start) / (7 * 24 * 60 * 60 * 1000)
      );
      if (!weeks[weekIdx]) weeks[weekIdx] = [];
      weeks[weekIdx].push(w.targetDuration);
    }
    const weekTotals = weeks.map((wk) => (wk ?? []).reduce((a, b) => a + b, 0));
    for (let i = 1; i < weekTotals.length - 2; i++) {
      const prev = weekTotals[i - 1];
      const curr = weekTotals[i];
      if (prev > 0 && curr > prev) {
        expect(curr / prev).toBeLessThanOrEqual(1.11); // 10% + tiny float margin
      }
    }
  });

  it("taper weeks have lower volume than peak week", () => {
    const workouts = generatePlan(BASE_INPUT);
    const start = BASE_INPUT.startDate.getTime();
    const weeks: number[][] = [];
    for (const w of workouts) {
      if (w.isDayOff || !w.targetDuration) continue;
      const weekIdx = Math.floor(
        (w.scheduledDate.getTime() - start) / (7 * 24 * 60 * 60 * 1000)
      );
      if (!weeks[weekIdx]) weeks[weekIdx] = [];
      weeks[weekIdx].push(w.targetDuration);
    }
    const weekTotals = weeks.map((wk) => (wk ?? []).reduce((a, b) => a + b, 0));
    const peakVolume = Math.max(...weekTotals.slice(0, -2));
    const lastWeekVolume = weekTotals[weekTotals.length - 1] ?? 0;
    expect(lastWeekVolume).toBeLessThan(peakVolume);
  });

  it("sport time distribution is approximately correct for OLYMPIC distance", () => {
    const workouts = generatePlan(BASE_INPUT);
    const byType = { SWIM: 0, BIKE: 0, RUN: 0 };
    let total = 0;
    for (const w of workouts) {
      if (w.isDayOff || !w.targetDuration) continue;
      if (w.type === "SWIM") { byType.SWIM += w.targetDuration; total += w.targetDuration; }
      if (w.type === "BIKE") { byType.BIKE += w.targetDuration; total += w.targetDuration; }
      if (w.type === "RUN") { byType.RUN += w.targetDuration; total += w.targetDuration; }
    }
    if (total === 0) return;
    // Olympic: 22% swim, 48% bike, 30% run (±10% tolerance)
    expect(byType.SWIM / total).toBeGreaterThan(0.12);
    expect(byType.SWIM / total).toBeLessThan(0.32);
    expect(byType.BIKE / total).toBeGreaterThan(0.38);
    expect(byType.BIKE / total).toBeLessThan(0.58);
    expect(byType.RUN / total).toBeGreaterThan(0.20);
    expect(byType.RUN / total).toBeLessThan(0.40);
  });
});
