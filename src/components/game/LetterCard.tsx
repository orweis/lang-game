"use client";
import { motion } from "framer-motion";
import type { HebrewLetter } from "@/types";
import { cn } from "@/lib/utils";

interface LetterCardProps {
  letter: HebrewLetter;
  isPlaying: boolean;
  onClick: () => void;
}

/** A tappable letter tile in the alphabet explorer. */
export function LetterCard({ letter, isPlaying, onClick }: LetterCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={isPlaying}
      aria-label={`${letter.nameRomanized} - ${letter.name}`}
      whileTap={{ scale: 0.88 }}
      animate={isPlaying ? { scale: 1.15 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative flex flex-col items-center justify-center",
        "rounded-3xl shadow-md cursor-pointer",
        "min-h-[88px] aspect-square w-full",
        "border-4 border-white/50",
        letter.color,
        isPlaying && "ring-4 ring-yellow-300 animate-pulse-ring"
      )}
    >
      <span className="text-5xl font-black text-white leading-none drop-shadow">
        {letter.letter}
      </span>
      <span className="text-xs font-bold text-white/90 mt-1 leading-tight">
        {letter.nameRomanized}
      </span>
    </motion.button>
  );
}
