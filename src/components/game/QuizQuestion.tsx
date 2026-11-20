"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { QuizQuestion as QuizQuestionData } from "@/types";
import { QuizChoice, type ChoiceState } from "./QuizChoice";
import { useAudio } from "@/hooks/useAudio";
import { TIMING } from "@/lib/constants";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: QuizQuestionData;
  /**
   * Called once per question, `TIMING.quizFeedback` ms after the child picks
   * an answer, so the right/wrong colours stay visible for a moment.
   */
  onAnswer: (correct: boolean) => void;
}

const SHOW_AS = {
  "letter-to-name": "name",
  "sound-to-letter": "letter",
  "word-to-emoji": "word",
} as const;

/**
 * Shows one quiz question, reads it aloud and handles the answer. Render it
 * with a new `key` for every question so its state starts fresh.
 */
export function QuizQuestion({ question, onAnswer }: QuizQuestionProps) {
  const { speak } = useAudio();
  const [states, setStates] = useState<Record<string, ChoiceState>>({});
  const answeredRef = useRef(false);
  const answerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read the question aloud shortly after it appears.
  useEffect(() => {
    const t = setTimeout(() => speak(question.ttsPrompt), TIMING.quizPromptDelay);
    return () => clearTimeout(t);
  }, [question.id, question.ttsPrompt, speak]);

  useEffect(
    () => () => {
      if (answerTimer.current) clearTimeout(answerTimer.current);
    },
    []
  );

  const handleChoice = (choiceId: string) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    const correct = choiceId === question.correctId;
    setStates({
      [choiceId]: correct ? "correct" : "wrong",
      [question.correctId]: "correct",
    });
    // On a wrong answer, repeat the question so the child hears the right one.
    speak(correct ? STRINGS.praise : question.ttsPrompt);
    answerTimer.current = setTimeout(() => onAnswer(correct), TIMING.quizFeedback);
  };

  const showAs = SHOW_AS[question.type];

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt area */}
      <div className="flex flex-col items-center gap-3 bg-white rounded-3xl shadow-md p-6">
        {question.type === "letter-to-name" && (
          <span className="text-8xl font-black text-slate-800">{question.prompt}</span>
        )}
        {question.type === "word-to-emoji" && (
          <span className="text-8xl">{question.prompt}</span>
        )}
        {question.type === "sound-to-letter" && (
          <span className="text-4xl font-bold text-slate-700">{question.prompt}</span>
        )}
        <motion.button
          type="button"
          onClick={() => speak(question.ttsPrompt)}
          whileTap={{ scale: 0.88 }}
          aria-label={STRINGS.listenAgain}
          className="flex items-center gap-2 bg-sky-100 hover:bg-sky-200 rounded-full px-5 py-2 text-2xl text-sky-700 font-bold transition-colors"
        >
          <span aria-hidden>🔊</span> <span className="text-lg">{STRINGS.listen}</span>
        </motion.button>
      </div>

      {/* Choices */}
      <div
        className={cn(
          "grid gap-4",
          question.choices.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"
        )}
      >
        {question.choices.map((choice) => (
          <QuizChoice
            key={choice.id}
            choice={choice}
            state={states[choice.id] ?? "idle"}
            onClick={() => handleChoice(choice.id)}
            showAs={showAs}
          />
        ))}
      </div>
    </div>
  );
}
