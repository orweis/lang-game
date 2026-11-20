"use client";
import { motion } from "framer-motion";
import { BigButton } from "@/components/ui/BigButton";
import { GameShell } from "@/components/layout/GameShell";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

interface ResultScreenProps {
  emoji: string;
  title: string;
  subtitle: string;
  onRestart: () => void;
  /** Colour classes for the replay button. */
  buttonClassName: string;
}

/** End-of-game screen shared by the match game and the quiz. */
export function ResultScreen({
  emoji,
  title,
  subtitle,
  onRestart,
  buttonClassName,
}: ResultScreenProps) {
  return (
    <GameShell>
      <div className="flex flex-col items-center justify-center gap-8 min-h-[70vh] text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div className="text-8xl mb-4" aria-hidden>
            {emoji}
          </div>
          <h2 className="text-5xl font-black text-slate-800">{title}</h2>
          <p className="text-3xl font-bold text-slate-600 mt-3">{subtitle}</p>
        </motion.div>
        <BigButton
          onClick={onRestart}
          className={cn("text-white text-3xl py-6 px-10", buttonClassName)}
          aria-label={STRINGS.playAgain}
        >
          🔄 {STRINGS.playAgain}
        </BigButton>
      </div>
    </GameShell>
  );
}
