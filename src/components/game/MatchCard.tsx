"use client";
import { motion } from "framer-motion";
import type { HebrewLetter } from "@/types";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  letter: HebrewLetter;
  isMatched: boolean;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, id: string) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function MatchCard({
  letter,
  isMatched,
  isDragging,
  dragOffset,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: MatchCardProps) {
  if (isMatched) {
    return (
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1], backgroundColor: "#86efac" }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center min-h-[88px] rounded-3xl bg-green-300 border-4 border-green-400 shadow-md"
      >
        <span className="text-5xl font-black text-green-800">{letter.letter}</span>
        <span className="text-2xl ml-1">✓</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      onPointerDown={(e) => onPointerDown(e, letter.id)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={
        isDragging
          ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`, zIndex: 50 }
          : {}
      }
      animate={isDragging ? { scale: 1.12 } : { scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center min-h-[88px] rounded-3xl shadow-md",
        "border-4 border-white/60 cursor-grab active:cursor-grabbing",
        "select-none touch-none",
        letter.color,
        isDragging && "shadow-2xl opacity-90"
      )}
    >
      <span className="text-5xl font-black text-white drop-shadow">{letter.letter}</span>
      <span className="text-xs font-bold text-white/80 mt-0.5">{letter.nameRomanized}</span>
    </motion.div>
  );
}
