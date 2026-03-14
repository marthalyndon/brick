import { describe, it, expect } from "vitest";
import { getUpcomingWorkouts, getWeekWorkouts } from "../workout";

describe("getUpcomingWorkouts", () => {
  it("is a function that accepts a limit", () => {
    expect(typeof getUpcomingWorkouts).toBe("function");
  });
});

describe("getWeekWorkouts", () => {
  it("is a function that accepts a date", () => {
    expect(typeof getWeekWorkouts).toBe("function");
  });

  it("snaps to Monday — passing a Wednesday returns week starting Monday", async () => {
    // Pure logic test — does not hit DB.
    // Use explicit local Date constructor (not ISO string) to avoid UTC/local timezone skew.
    const { weekStart } = await import("../workout");
    const wed = new Date(2026, 2, 11); // March 11, 2026 (month is 0-indexed)
    const monday = weekStart(wed);
    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(2);   // March
    expect(monday.getDate()).toBe(9);    // 9th
    expect(monday.getDay()).toBe(1);     // Monday
  });
});
