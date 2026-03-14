"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "filled" | "outline" | "blank";
type ButtonStatus = "default" | "plain" | "error" | "disabled";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  status?: ButtonStatus;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children: ReactNode;
}

const styles: Record<ButtonVariant, Record<ButtonStatus, string>> = {
  filled: {
    default:  "bg-core-accent text-core-background",
    plain:    "bg-core-primary text-core-background",
    error:    "bg-core-error text-core-background",
    disabled: "bg-core-gray-200 text-core-gray-400 cursor-not-allowed",
  },
  outline: {
    default:  "border-2 border-core-accent text-core-accent",
    plain:    "border-2 border-core-gray-500 text-core-gray-500",
    error:    "border-2 border-core-error text-core-error",
    disabled: "border-2 border-core-gray-200 text-core-gray-400 cursor-not-allowed",
  },
  blank: {
    default:  "text-core-accent",
    plain:    "text-core-primary",
    error:    "text-core-error",
    disabled: "text-core-gray-400 cursor-not-allowed",
  },
};

export function Button({
  variant = "filled",
  status = "default",
  icon,
  iconPosition = "left",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const resolvedStatus = disabled ? "disabled" : status;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-1
        h-8 px-4 rounded-[var(--radius-m)]
        text-[12px] font-semibold leading-none
        transition-opacity
        ${styles[variant][resolvedStatus]}
        ${resolvedStatus !== "disabled" ? "hover:opacity-85 active:opacity-70" : ""}
        ${className}
      `.trim()}
      disabled={disabled ?? resolvedStatus === "disabled"}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <span className="size-4 shrink-0">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span className="size-4 shrink-0">{icon}</span>
      )}
    </button>
  );
}
