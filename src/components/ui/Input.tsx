"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type InputType = "default" | "filled" | "error" | "disabled";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  inputType?: InputType;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  error?: string;
  htmlType?: InputHTMLAttributes<HTMLInputElement>["type"];
}

const fieldStyles: Record<InputType, string> = {
  // "filled" matches "default" visually — both use the gray-100 background.
  // The distinction exists in the design system for state tracking (has content vs empty)
  // but does not produce a different appearance.
  default:  "bg-core-gray-100 border-transparent",
  filled:   "bg-core-gray-100 border-transparent",
  error:    "bg-core-error-light border border-core-error",
  disabled: "bg-core-gray-100 border-transparent opacity-50 cursor-not-allowed",
};

export function Input({
  label,
  inputType = "default",
  startIcon,
  endIcon,
  error,
  htmlType = "text",
  className = "",
  disabled,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const resolvedType = disabled ? "disabled" : inputType;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-medium text-core-primary leading-[1.5]"
        >
          {label}
        </label>
      )}
      <div
        className={`
          flex items-center gap-2 h-8 px-2 rounded-[var(--radius-s)]
          ${fieldStyles[resolvedType]}
        `.trim()}
      >
        {startIcon && (
          <span className="size-4 shrink-0 text-core-gray-400">{startIcon}</span>
        )}
        <input
          id={inputId}
          type={htmlType}
          disabled={disabled ?? resolvedType === "disabled"}
          className="flex-1 min-w-0 bg-transparent text-[12px] font-medium text-core-primary placeholder:text-core-gray-400 outline-none"
          {...props}
        />
        {endIcon && (
          <span className="size-4 shrink-0 text-core-gray-400">{endIcon}</span>
        )}
      </div>
      {error && (
        <p className="text-[10px] font-medium text-core-error leading-[1.5]">{error}</p>
      )}
    </div>
  );
}
