"use client";

import { Timer, Route, Check, BedDouble } from "lucide-react";
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

// ── REST card ──────────────────────────────────────────────────────────────────

function RestCardFull({ className = "" }: { className?: string }) {
  return (
    <div
      className={`
        bg-core-background rounded-[var(--radius-m)] border-l-4 border-l-core-gray-300
        shadow-[var(--shadow-card)] p-4
        flex flex-col items-center justify-center gap-2
        w-full max-w-sm min-h-[160px]
        ${className}
      `.trim()}
    >
      <BedDouble className="size-11 text-core-gray-300" />
      <span className="text-[24px] font-semibold text-core-gray-400 leading-[1.2]">Rest</span>
    </div>
  );
}

function RestCardUpcoming({ dateLabel, className = "" }: { dateLabel?: string; className?: string }) {
  return (
    <div
      className={`
        bg-core-background rounded-[var(--radius-m)] border-l-4 border-l-core-gray-300
        shadow-[var(--shadow-card)] px-4 py-3
        flex items-center gap-2
        w-full max-w-sm
        ${className}
      `.trim()}
    >
      <BedDouble className="size-4 text-core-gray-400 shrink-0" />
      <span className="text-[16px] font-semibold text-core-gray-400 leading-[1.3]">Rest</span>
      {dateLabel && (
        <span className="ml-auto text-[10px] font-bold tracking-wide text-core-gray-300 uppercase">
          {dateLabel}
        </span>
      )}
    </div>
  );
}

// ── Main card ──────────────────────────────────────────────────────────────────

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
  if (type === "REST") {
    return size === "full"
      ? <RestCardFull className={className} />
      : <RestCardUpcoming dateLabel={dateLabel} className={className} />;
  }

  const isSkip     = version === "skip";
  const isComplete = version === "complete";
  const borderColor = isSkip
    ? "border-l-core-gray-400"
    : (sportBorderColor[type] ?? "border-l-core-gray-300");

  return (
    <div
      className={`
        bg-core-background rounded-[var(--radius-m)] border-l-4 ${borderColor}
        shadow-[var(--shadow-card)] p-4
        flex flex-col gap-2
        ${size === "upcoming" ? "max-w-sm" : "w-full max-w-sm"}
        ${className}
      `.trim()}
    >
      {/* Header: sport tag + goal chip + optional date label */}
      <div className="flex items-center gap-2">
        <Tag type={isSkip ? "grey" : type} icon={<SportIcon type={type} />}>
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </Tag>
        {goal && <Chip type="grey">{goalLabel[goal]}</Chip>}
        {dateLabel && size === "upcoming" && (
          <span className="ml-auto text-[10px] font-bold tracking-wide text-core-gray-300 uppercase">
            {dateLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <p
        className={`
          leading-[1.2]
          ${size === "upcoming" ? "text-[16px] font-extrabold" : "text-[24px] font-bold"}
          ${isSkip ? "text-core-gray-500" : "text-core-primary"}
        `.trim()}
      >
        {title}
      </p>

      {/* Stats */}
      {(targetDuration != null || targetDistance != null) && (
        <div className="flex items-center gap-4">
          {targetDuration != null && (
            <span className={`flex items-center gap-1 text-[12px] font-medium ${isSkip ? "text-core-gray-500" : "text-core-primary"}`}>
              <Timer className="size-3" />
              {formatDuration(targetDuration)}
            </span>
          )}
          {targetDistance != null && (
            <span className={`flex items-center gap-1 text-[12px] font-medium ${isSkip ? "text-core-gray-500" : "text-core-primary"}`}>
              <Route className="size-3" />
              {formatDistance(targetDistance)}
            </span>
          )}
        </div>
      )}

      {/* Actions — full cards only */}
      {size === "full" && (
        <div className="flex items-center gap-2 mt-1">
          {version === "plan" && (
            <>
              <Button
                variant="filled"
                icon={<Check className="size-4" />}
                iconPosition="left"
                onClick={onComplete}
              >
                Complete
              </Button>
              <Button variant="outline" status="plain" onClick={onSkip}>
                Skip
              </Button>
            </>
          )}
          {isComplete && (
            <Button
              variant="filled"
              status="plain"
              icon={<Check className="size-4" />}
              iconPosition="left"
            >
              Completed
            </Button>
          )}
          {isSkip && (
            <Button variant="outline" status="plain">
              Skipped
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
