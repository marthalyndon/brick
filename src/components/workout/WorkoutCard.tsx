"use client";

import { Timer, Route, Check } from "lucide-react";
import { type WorkoutType, type WorkoutGoal } from "@/generated/prisma/client";
import { Tag } from "@/components/ui/Tag";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { SportIcon } from "@/components/icons/SportIcon";

type CardVersion = "plan" | "complete" | "skip";
type CardSize = "full" | "upcoming";

interface WorkoutCardProps {
  version?: CardVersion;
  size?: CardSize;
  type: WorkoutType;
  title: string;
  goal?: WorkoutGoal | null;
  targetDuration?: number | null;   // seconds
  targetDistance?: number | null;   // meters
  dateLabel?: string;
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

const sportBorderColor: Record<WorkoutType, string> = {
  SWIM:     "border-l-sports-swim",
  BIKE:     "border-l-sports-bike",
  RUN:      "border-l-sports-run",
  STRENGTH: "border-l-sports-strength",
  BRICK:    "border-l-core-accent",
  REST:     "border-l-core-gray-300",
  OTHER:    "border-l-core-gray-300",
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}hr ${m}min`;
  if (h > 0) return `${h}hr`;
  return `${m}min`;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(0)}km`;
  return `${Math.round(meters)}m`;
}

const goalLabel: Record<WorkoutGoal, string> = {
  ENDURANCE:  "Endurance",
  TEMPO:      "Tempo",
  INTERVALS:  "Intervals",
  RECOVERY:   "Recovery",
  RACE_PACE:  "Race Pace",
  OPEN_WATER: "Open Water",
  TECHNIQUE:  "Technique",
  FREE:       "Free",
};

// ── Card ───────────────────────────────────────────────────────────────────

export function WorkoutCard({
  version = "plan",
  size = "full",
  type,
  title,
  goal,
  targetDuration,
  targetDistance,
  dateLabel,
  className = "",
  onComplete,
  onSkip,
}: WorkoutCardProps) {
  const borderColor = sportBorderColor[type] ?? "border-l-core-gray-300";

  return (
    <div
      className={`
        bg-core-background rounded-[var(--radius-m)] border-l-4 ${borderColor}
        shadow-[var(--shadow-card)] p-4
        flex flex-col gap-2
        ${size === "upcoming" ? "max-w-sm" : "w-full max-w-sm"}
        ${version === "complete" ? "opacity-75" : ""}
        ${version === "skip" ? "opacity-50" : ""}
        ${className}
      `.trim()}
    >
      {/* Header row: sport tag + goal chip + optional date label */}
      <div className="flex items-center gap-2">
        <Tag type={type} icon={<SportIcon type={type} />}>
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </Tag>
        {goal && (
          <Chip type="grey">{goalLabel[goal]}</Chip>
        )}
        {version === "complete" && (
          <Chip type="accent">Done</Chip>
        )}
        {version === "skip" && (
          <Chip type="grey">Skipped</Chip>
        )}
        {dateLabel && size === "upcoming" && (
          <span className="ml-auto text-[11px] font-semibold tracking-wide text-core-gray-400 uppercase">
            {dateLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-[24px] font-bold text-core-primary leading-[1.2]">{title}</p>

      {/* Stats */}
      {type !== "REST" && (targetDuration != null || targetDistance != null) && (
        <div className="flex items-center gap-2">
          {targetDuration != null && (
            <span className="flex items-center gap-1 text-[12px] font-medium text-core-primary">
              <Timer className="size-3" />
              {formatDuration(targetDuration)}
            </span>
          )}
          {targetDistance != null && (
            <span className="flex items-center gap-1 text-[12px] font-medium text-core-primary">
              <Route className="size-3" />
              {formatDistance(targetDistance)}
            </span>
          )}
        </div>
      )}

      {/* Actions — only on full-size plan cards */}
      {version === "plan" && size === "full" && (
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="filled"
            icon={<Check className="size-4" />}
            iconPosition="left"
            onClick={onComplete}
          >
            Complete
          </Button>
          <Button
            variant="outline"
            status="plain"
            onClick={onSkip}
          >
            Skip
          </Button>
        </div>
      )}
    </div>
  );
}
