"use client";
import { motion } from "framer-motion";
import type { HebrewLetter } from "@/types";
import { cn } from "@/lib/utils";

type PointerHandler = (e: React.PointerEvent<HTMLDivElement>) => void;

interface MatchCardProps {
  letter: HebrewLetter;
  isMatched: boolean;
  isDragging: boolean;
  /** Selected with the keyboard, waiting to be placed on a word. */
  isSelected?: boolean;
  dragOffset: { x: number; y: number };
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, id: string) => void;
  onPointerMove: PointerHandler;
  onPointerUp: PointerHandler;
  onPointerCancel?: PointerHandler;
  /** Keyboard alternative to dragging: Enter or Space selects the card. */
  onSelect?: (id: string) => void;
}

/** A draggable letter in the match game. */
export function MatchCard({
  letter,
  isMatched,
  isDragging,
  isSelected = false,
  dragOffset,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onSelect,
}: MatchCardProps) {
  if (isMatched) {
    return (
      <motion.div
        data-testid={`match-card-${letter.id}`}
        data-matched="true"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1], backgroundColor: "#86efac" }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center min-h-[88px] rounded-3xl bg-green-300 border-4 border-green-400 shadow-md"
      >
        <span className="text-5xl font-black text-green-800">{letter.letter}</span>
        <span className="text-2xl ml-1" aria-hidden>
          ✓
        </span>
      </motion.div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(letter.id);
    }
  };

  return (
    <motion.div
      data-testid={`match-card-${letter.id}`}
      role="button"
      tabIndex={0}
      aria-label={`${letter.letter} ${letter.nameRomanized}`}
      aria-pressed={isSelected}
      onPointerDown={(e) => onPointerDown(e, letter.id)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={handleKeyDown}
      style={
        isDragging
          ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`, zIndex: 50 }
          : {}
      }
      animate={isDragging ? { scale: 1.12 } : { scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center min-h-[88px] rounded-3xl shadow-md",
        "border-4 border-white/60 cursor-grab active:cursor-grabbing",
        "select-none touch-none focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500",
        letter.color,
        isDragging && "shadow-2xl opacity-90",
        isSelected && "ring-4 ring-yellow-300"
      )}
    >
      <span className="text-5xl font-black text-white drop-shadow">{letter.letter}</span>
      <span className="text-xs font-bold text-white/80 mt-0.5">{letter.nameRomanized}</span>
    </motion.div>
  );
}
