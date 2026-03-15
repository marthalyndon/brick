import { type ReactNode } from "react";
import { Check, X, Circle, Minus } from "lucide-react";
import { SportIcon } from "@/components/icons/SportIcon";
import type { WorkoutType } from "@/generated/prisma/client";

type DayStatus = "completed" | "missed" | "today" | "future";

interface AtAGlanceCellProps {
  dayLetter: string;           // "Su", "M", "T", etc.
  status: DayStatus;
  workoutTypes: WorkoutType[]; // sports scheduled (empty = rest/day-off)
  isRest?: boolean;            // true = day-off / rest day
}

const statusIcon: Record<DayStatus, ReactNode> = {
  completed: <Check  className="size-3 text-core-accent"     />,
  missed:    <X      className="size-3 text-core-gray-400"   />,
  today:     <Circle className="size-3 text-core-accent"     />,
  future:    <Minus  className="size-3 text-core-gray-300"   />,
};

// Pill bg for normal (non-missed) sport workouts
const sportPillBg: Record<WorkoutType, string> = {
  SWIM:     "bg-sports-swim-light",
  BIKE:     "bg-sports-bike-light",
  RUN:      "bg-sports-run-light",
  STRENGTH: "bg-sports-strength-light",
  BRICK:    "bg-core-accent/15",
  REST:     "bg-core-gray-100",
  OTHER:    "bg-core-gray-200",
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

export function AtAGlanceCell({ dayLetter, status, workoutTypes, isRest = false }: AtAGlanceCellProps) {
  const isToday   = status === "today";
  const isMissed  = status === "missed";
  // "rest" = truly no workout / day-off
  const noWorkout = isRest || workoutTypes.length === 0;

  // Which pill background to use
  function pillBg(type: WorkoutType) {
    return isMissed ? "bg-core-gray-200" : sportPillBg[type];
  }

  return (
    <div
      className={`
        flex flex-col gap-1 h-full
        rounded-[var(--radius-m)]
        ${isToday
          ? "border-2 border-core-accent bg-core-background px-[6px] py-[6px]"
          : "bg-core-background p-2"}
      `.trim()}
    >
      {/* Header: status icon + day letter inline, centered */}
      <div className="flex items-center justify-center gap-[2px] shrink-0">
        <span className="flex items-center shrink-0">{statusIcon[status]}</span>
        <span className="text-[10px] font-bold text-core-primary leading-[1.5] whitespace-nowrap">
          {dayLetter}
        </span>
      </div>

      {/* Pill area — fills remaining height */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        {noWorkout ? (
          // REST / day-off: single grey-100 pill, no icon
          <div className="flex-1 min-h-0 w-full rounded-[var(--radius-s)] bg-core-gray-100" />
        ) : (
          workoutTypes.slice(0, 2).map((type, i) => (
            <div
              key={i}
              className={`
                flex flex-1 min-h-0 items-center justify-center
                px-2 rounded-[var(--radius-s)]
                ${pillBg(type)}
              `.trim()}
            >
              <span className={isMissed ? "text-core-gray-400" : sportIconColor[type]}>
                <SportIcon type={type} className="size-4" />
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
