import { getTodayWorkouts, getUpcomingWorkouts, getWeekWorkouts } from "@/services/workout";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { AtAGlanceCell } from "@/components/workout/AtAGlanceCell";
import type { PlannedWorkout, WorkoutType } from "@/lib/types";

// ── Helpers ────────────────────────────────────────────────────────────────────

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dateLabel(scheduledDate: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (new Date(scheduledDate).setHours(0,0,0,0) - today.getTime()) / 86_400_000
  );
  if (diff === 1) return "TOMORROW";
  if (diff > 1 && diff < 7) return DAY_NAMES[new Date(scheduledDate).getDay()].toUpperCase();
  return "";
}

type DayStatus = "completed" | "missed" | "today" | "future";

interface WeekCell {
  dayLetter: string;
  status: DayStatus;
  workoutTypes: WorkoutType[];
}

function buildWeekCells(weekWorkouts: PlannedWorkout[]): WeekCell[] {
  const todayKey = toDateKey(new Date());

  // Group workouts by date key
  const byDay = new Map<string, PlannedWorkout[]>();
  for (const w of weekWorkouts) {
    const key = toDateKey(new Date(w.scheduledDate));
    const arr = byDay.get(key) ?? [];
    arr.push(w);
    byDay.set(key, arr);
  }

  // Build 7 cells starting from Monday of this week
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = toDateKey(d);
    const workouts = byDay.get(key) ?? [];
    const isPast = d < new Date(new Date().setHours(0,0,0,0));
    const isToday = key === todayKey;
    const anyCompleted = workouts.some((w) => w.logId !== null);
    const isDayOff = workouts.length > 0 && workouts.every((w) => w.isDayOff);

    let status: DayStatus;
    if (isToday) {
      status = "today";
    } else if (isPast) {
      status = anyCompleted ? "completed" : "missed";
    } else {
      status = "future";
    }

    const workoutTypes = isDayOff
      ? []
      : workouts
          .filter((w) => !w.isDayOff && w.type !== "REST")
          .map((w) => w.type as WorkoutType);

    return {
      dayLetter: DAY_LETTERS[(monday.getDay() + i) % 7],
      status,
      workoutTypes,
    };
  });
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [todayWorkouts, upcomingWorkouts, weekWorkouts] = await Promise.all([
    getTodayWorkouts(),
    getUpcomingWorkouts(3),
    getWeekWorkouts(new Date()),
  ]);

  const weekCells = buildWeekCells(weekWorkouts);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">

      {/* ── Today ─────────────────────────────────────────────────────────── */}
      <section>
        <h1 className="text-[24px] font-bold text-core-primary mb-3">Today</h1>
        {todayWorkouts.length === 0 ? (
          <div className="rounded-[var(--radius-m)] border border-core-gray-200 p-4">
            <p className="text-core-gray-400 text-sm">No workouts scheduled today.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todayWorkouts.map((w) => (
              <WorkoutCard
                key={w.id}
                version={w.logId ? "complete" : "plan"}
                size="full"
                type={w.type as WorkoutType}
                title={w.title}
                goal={w.goal}
                targetDuration={w.targetDuration}
                targetDistance={w.targetDistance}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Upcoming ──────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-[16px] font-semibold text-core-gray-400 mb-3">Upcoming</h2>
        {upcomingWorkouts.length === 0 ? (
          <p className="text-core-gray-400 text-sm">Nothing scheduled ahead.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {upcomingWorkouts.map((w) => (
              <WorkoutCard
                key={w.id}
                version="plan"
                size="upcoming"
                type={w.type as WorkoutType}
                title={w.title}
                goal={w.goal}
                targetDuration={w.targetDuration}
                targetDistance={w.targetDistance}
                dateLabel={dateLabel(new Date(w.scheduledDate))}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Week At A Glance ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-[16px] font-semibold text-core-gray-400 mb-3">Week At A Glance</h2>
        <div className="bg-core-background rounded-[var(--radius-m)] p-3 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-7 gap-1">
            {weekCells.map((cell, i) => (
              <AtAGlanceCell
                key={i}
                dayLetter={cell.dayLetter}
                status={cell.status}
                workoutTypes={cell.workoutTypes}
              />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
