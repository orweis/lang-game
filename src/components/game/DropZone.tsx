"use client";
import { motion } from "framer-motion";
import type { HebrewWord } from "@/types";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  word: HebrewWord;
  isMatched: boolean;
  dropZoneId: string;
  /** Called when the zone is clicked or activated with Enter/Space. */
  onActivate?: (dropZoneId: string) => void;
}

/** A word that a letter can be dropped on in the match game. */
export function DropZone({ word, isMatched, dropZoneId, onActivate }: DropZoneProps) {
  if (isMatched) {
    return (
      <motion.div
        data-testid={`dropzone-${word.id}`}
        data-matched="true"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center min-h-[88px] rounded-3xl bg-green-200 border-4 border-green-400 shadow-md gap-1"
      >
        <span className="text-3xl" aria-hidden>
          {word.emoji}
        </span>
        <span className="text-xl font-bold text-green-800">{word.word}</span>
      </motion.div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate?.(dropZoneId);
    }
  };

  return (
    <div
      data-testid={`dropzone-${word.id}`}
      data-dropzone={dropZoneId}
      role="button"
      tabIndex={0}
      aria-label={word.word}
      onClick={() => onActivate?.(dropZoneId)}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex flex-col items-center justify-center min-h-[88px] rounded-3xl",
        "border-4 border-dashed border-sky-300 bg-white/60 shadow-sm gap-1",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
      )}
    >
      <span className="text-3xl" aria-hidden>
        {word.emoji}
      </span>
      <span className="text-xl font-bold text-slate-700">{word.word}</span>
    </div>
  );
}
