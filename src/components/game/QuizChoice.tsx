"use client";
import { motion } from "framer-motion";
import type { HebrewLetter, QuizChoiceItem } from "@/types";
import { cn } from "@/lib/utils";

export type ChoiceState = "idle" | "correct" | "wrong";

interface QuizChoiceProps {
  choice: QuizChoiceItem;
  state: ChoiceState;
  onClick: () => void;
  showAs: "letter" | "word" | "name";
}

const STATE_CLASSES: Record<ChoiceState, string> = {
  idle: "bg-white hover:bg-sky-50 border-sky-200 text-slate-800",
  correct: "bg-green-300 border-green-400 text-green-900",
  wrong: "bg-red-300 border-red-400 text-red-900",
};

function isLetter(c: QuizChoiceItem): c is HebrewLetter {
  return "letter" in c;
}

/** One answer button in the quiz, showing a letter, a letter name or a word. */
export function QuizChoice({ choice, state, onClick, showAs }: QuizChoiceProps) {
  const content = () => {
    if (showAs === "letter" && isLetter(choice)) {
      return <span className="text-6xl font-black">{choice.letter}</span>;
    }
    if (showAs === "name" && isLetter(choice)) {
      return (
        <span className="text-3xl font-bold text-center leading-snug">
          {choice.name}
        </span>
      );
    }
    if (showAs === "word" && !isLetter(choice)) {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl" aria-hidden>
            {choice.emoji}
          </span>
          <span className="text-2xl font-bold">{choice.word}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      data-state={state}
      disabled={state !== "idle"}
      animate={
        state === "wrong"
          ? { x: [0, -10, 10, -8, 8, 0] }
          : state === "correct"
          ? { scale: [1, 1.12, 1] }
          : {}
      }
      whileTap={state === "idle" ? { scale: 0.92 } : {}}
      whileHover={state === "idle" ? { scale: 1.04 } : {}}
      transition={{ duration: 0.35 }}
      className={cn(
        "flex items-center justify-center",
        "min-h-[110px] w-full rounded-3xl border-4 shadow-md",
        "transition-colors duration-150 cursor-pointer",
        "disabled:cursor-default px-4 py-4",
        STATE_CLASSES[state]
      )}
    >
      {content()}
      {state === "correct" && (
        <span className="ml-2 text-3xl" aria-hidden>
          ✓
        </span>
      )}
    </motion.button>
  );
}
