import { SportIcon } from "@/components/icons/SportIcon";
import type { WorkoutType } from "@/generated/prisma/client";

type DayStatus = "completed" | "missed" | "today" | "future";

interface AtAGlanceCellProps {
  dayLetter: string;           // "M", "T", "W", etc.
  status: DayStatus;
  workoutTypes: WorkoutType[]; // sports scheduled that day (empty = rest/day-off)
}

const statusIcon: Record<DayStatus, string> = {
  completed: "✓",
  missed:    "✗",
  today:     "○",
  future:    "·",
};

const statusColor: Record<DayStatus, string> = {
  completed: "text-core-accent",
  missed:    "text-core-gray-400",
  today:     "text-core-accent",
  future:    "text-core-gray-300",
};

const sportIconColor: Record<WorkoutType, string> = {
  SWIM:     "text-sports-swim",
  BIKE:     "text-sports-bike",
  RUN:      "text-sports-run",
  STRENGTH: "text-sports-strength",
  BRICK:    "text-core-accent",
  REST:     "text-core-gray-300",
  OTHER:    "text-core-gray-300",
};

export function AtAGlanceCell({ dayLetter, status, workoutTypes }: AtAGlanceCellProps) {
  const isToday = status === "today";

  return (
    <div
      className={`
        flex flex-col items-center gap-1 p-2 rounded-[var(--radius-m)] min-w-[40px]
        ${isToday ? "border-2 border-core-accent bg-core-background" : "bg-core-background"}
      `.trim()}
    >
      {/* Day letter */}
      <span className="text-[11px] font-semibold text-core-gray-400 uppercase leading-none">
        {dayLetter}
      </span>

      {/* Status icon */}
      <span className={`text-[11px] font-bold leading-none ${statusColor[status]}`}>
        {statusIcon[status]}
      </span>

      {/* Sport icons — up to 2 */}
      {workoutTypes.slice(0, 2).map((type, i) => (
        <span key={i} className={sportIconColor[type]}>
          <SportIcon type={type} className="size-4" />
        </span>
      ))}

      {/* Placeholder height if no sports (rest day) */}
      {workoutTypes.length === 0 && (
        <span className="size-4" />
      )}
    </div>
  );
}
