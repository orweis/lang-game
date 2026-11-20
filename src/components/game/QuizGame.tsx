"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/layout/GameShell";
import { QuizQuestion } from "@/components/game/QuizQuestion";
import { CelebrationOverlay } from "@/components/ui/CelebrationOverlay";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ResultScreen } from "@/components/ui/ResultScreen";
import { useIsClient } from "@/hooks/useIsClient";
import { TIMING } from "@/lib/constants";
import { buildQuizQuestions } from "@/lib/questions";
import { STRINGS, outOf } from "@/lib/strings";
import type { QuizQuestion as QuizQuestionData } from "@/types";

interface QuizGameProps {
  /** Builds the questions for a session. Defaults to a random 15-question quiz. */
  buildQuestions?: () => QuizQuestionData[];
}

/**
 * The quiz mode. A correct answer shows a celebration before the next
 * question; a wrong answer briefly shows the right one and moves on.
 * "Play again" starts a fresh, newly shuffled session.
 */
export function QuizGame({ buildQuestions = buildQuizQuestions }: QuizGameProps) {
  const isClient = useIsClient();
  const [session, setSession] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestionData[]>(buildQuestions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = questions.length;
  const done = currentIdx >= total;

  const clearWrongTimer = () => {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    wrongTimer.current = null;
  };
  useEffect(() => clearWrongTimer, []);

  const advance = useCallback(() => setCurrentIdx((i) => i + 1), []);

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore((s) => s + 1);
      setShowCelebration(true);
    } else {
      clearWrongTimer();
      wrongTimer.current = setTimeout(advance, TIMING.quizWrongPause);
    }
  };

  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);
    advance();
  }, [advance]);

  const restart = () => {
    clearWrongTimer();
    setQuestions(buildQuestions());
    setSession((s) => s + 1);
    setCurrentIdx(0);
    setScore(0);
    setShowCelebration(false);
  };

  // Questions are random, so they are only rendered in the browser.
  if (!isClient) return <GameShell title={STRINGS.quizTitle}>{null}</GameShell>;

  if (done) {
    return (
      <ResultScreen
        emoji="🎉"
        title={STRINGS.finished}
        subtitle={`${outOf(score, total)} ⭐`}
        onRestart={restart}
        buttonClassName="bg-purple-400 hover:bg-purple-300"
      />
    );
  }

  const question = questions[currentIdx];

  return (
    <GameShell title={STRINGS.quizTitle}>
      <ProgressBar current={currentIdx} total={total} />
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${session}-${question.id}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25 }}
          >
            <QuizQuestion question={question} onAnswer={handleAnswer} />
          </motion.div>
        </AnimatePresence>
      </div>
      <CelebrationOverlay show={showCelebration} onComplete={handleCelebrationDone} />
    </GameShell>
  );
}
