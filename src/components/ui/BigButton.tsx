"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BigButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  "aria-label"?: string;
}

export function BigButton({
  children,
  onClick,
  className,
  disabled,
  type = "button",
  "aria-label": ariaLabel,
}: BigButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      className={cn(
        "min-h-touch min-w-touch rounded-3xl px-8 py-4",
        "font-bold text-2xl shadow-lg",
        "transition-colors duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "cursor-pointer select-none",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
