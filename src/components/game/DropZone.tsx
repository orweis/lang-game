"use client";
import { motion } from "framer-motion";
import type { HebrewWord } from "@/types";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  word: HebrewWord;
  isMatched: boolean;
  dropZoneId: string;
}

export function DropZone({ word, isMatched, dropZoneId }: DropZoneProps) {
  if (isMatched) {
    return (
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center min-h-[88px] rounded-3xl bg-green-200 border-4 border-green-400 shadow-md gap-1"
      >
        <span className="text-3xl">{word.emoji}</span>
        <span className="text-xl font-bold text-green-800">{word.word}</span>
      </motion.div>
    );
  }

  return (
    <div
      data-dropzone={dropZoneId}
      className={cn(
        "flex flex-col items-center justify-center min-h-[88px] rounded-3xl",
        "border-4 border-dashed border-sky-300 bg-white/60 shadow-sm gap-1",
        "transition-colors duration-150"
      )}
    >
      <span className="text-3xl">{word.emoji}</span>
      <span className="text-xl font-bold text-slate-700">{word.word}</span>
    </div>
  );
}
