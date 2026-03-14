import { type ReactNode } from "react";
import { type WorkoutType } from "@/generated/prisma/client";

type TagType = WorkoutType | "accent" | "plain" | "grey" | "error";

interface TagProps {
  type: TagType;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const tagStyles: Record<TagType, string> = {
  accent:   "bg-core-accent-light text-core-accent",
  SWIM:     "bg-sports-swim-light text-sports-swim",
  BIKE:     "bg-sports-bike-light text-sports-bike",
  RUN:      "bg-sports-run-light text-sports-run",
  STRENGTH: "bg-sports-strength-light text-sports-strength",
  BRICK:    "bg-core-accent-light text-core-accent",
  REST:     "bg-core-gray-100 text-core-gray-400",
  OTHER:    "bg-core-gray-100 text-core-gray-400",
  plain:    "bg-core-primary text-core-background",
  grey:     "bg-core-gray-100 text-core-gray-400",
  error:    "bg-core-error-light text-core-error",
};

export function Tag({ type, icon, children, className = "" }: TagProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-1 rounded-[var(--radius-s)]
        text-[12px] font-medium leading-[1.5]
        ${tagStyles[type]}
        ${className}
      `.trim()}
    >
      {icon && <span className="size-4 shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
