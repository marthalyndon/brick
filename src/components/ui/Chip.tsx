import { type ReactNode } from "react";

type ChipType = "accent" | "plain" | "grey" | "error";

interface ChipProps {
  type?: ChipType;
  children: ReactNode;
  className?: string;
}

const chipStyles: Record<ChipType, string> = {
  accent: "bg-core-accent-light text-core-accent",
  plain:  "bg-core-primary text-core-background",
  grey:   "bg-core-gray-100 text-core-gray-400",
  error:  "bg-core-error-light text-core-error",
};

export function Chip({ type = "grey", children, className = "" }: ChipProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-4 py-1 rounded-[var(--radius-l)]
        text-[12px] font-medium leading-[1.5]
        ${chipStyles[type]}
        ${className}
      `.trim()}
    >
      {children}
    </span>
  );
}
