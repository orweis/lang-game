"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/layout/GameShell";
import { QuizQuestion } from "@/components/game/QuizQuestion";
import { CelebrationOverlay } from "@/components/ui/CelebrationOverlay";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BigButton } from "@/components/ui/BigButton";
import { ALPHABET, WORDS } from "@/data";
import type { QuizQuestion as QuizQuestionType } from "@/types";
import { shuffle, pickRandom, getDistractors } from "@/lib/utils";

const TOTAL = 15;

function buildQuestions(): QuizQuestionType[] {
  const questions: QuizQuestionType[] = [];

  // 5x letter-to-name: show letter, pick its name from 3 options
  const lettersForLTN = pickRandom(ALPHABET, 5);
  for (const letter of lettersForLTN) {
    const distractors = getDistractors(ALPHABET, letter.id, 2);
    questions.push({
      id: `ltn-${letter.id}`,
      type: "letter-to-name",
      prompt: letter.letter,
      ttsPrompt: letter.ttsPhrase,
      correctId: letter.id,
      choices: shuffle([letter, ...distractors]),
    });
  }

  // 5x word-to-emoji: show emoji, pick the matching Hebrew word
  const wordsForWTE = pickRandom(WORDS, 5);
  for (const word of wordsForWTE) {
    const distractors = getDistractors(WORDS, word.id, 2);
    questions.push({
      id: `wte-${word.id}`,
      type: "word-to-emoji",
      prompt: word.emoji,
      ttsPrompt: word.ttsPhrase,
      correctId: word.id,
      choices: shuffle([word, ...distractors]),
    });
  }

  // 5x sound-to-letter: speak letter name, tap the correct letter glyph
  const lettersForSTL = pickRandom(ALPHABET, 5);
  for (const letter of lettersForSTL) {
    const distractors = getDistractors(ALPHABET, letter.id, 2);
    questions.push({
      id: `stl-${letter.id}`,
      type: "sound-to-letter",
      prompt: `"${letter.nameRomanized}" — ?`,
      ttsPrompt: letter.ttsPhrase,
      correctId: letter.id,
      choices: shuffle([letter, ...distractors]),
    });
  }

  return shuffle(questions);
}

export default function QuizPage() {
  const [questions] = useState<QuizQuestionType[]>(() => buildQuestions());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [done, setDone] = useState(false);

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore((s) => s + 1);
      setShowCelebration(true);
    }
  };

  const handleCelebrationDone = () => {
    setShowCelebration(false);
    advance();
  };

  const advance = () => {
    const next = currentIdx + 1;
    if (next >= TOTAL) {
      setDone(true);
    } else {
      setCurrentIdx(next);
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setScore(0);
    setDone(false);
    setShowCelebration(false);
  };

  if (done) {
    return (
      <GameShell>
        <div className="flex flex-col items-center justify-center gap-8 min-h-[70vh] text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-5xl font-black text-slate-800">סיימת!</h2>
            <p className="text-3xl font-bold text-slate-600 mt-3">
              {score} מתוך {TOTAL} ⭐
            </p>
          </motion.div>
          <BigButton
            onClick={restart}
            className="bg-purple-400 text-white hover:bg-purple-300 text-3xl py-6 px-10"
            aria-label="שחק שוב"
          >
            🔄 שחק שוב
          </BigButton>
        </div>
      </GameShell>
    );
  }

  const question = questions[currentIdx];

  return (
    <GameShell title="❓ חִידוֹן">
      <ProgressBar current={currentIdx} total={TOTAL} />
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25 }}
          >
            <QuizQuestion
              question={question}
              onAnswer={(correct) => {
                handleAnswer(correct);
                if (!correct) setTimeout(advance, 2000);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <CelebrationOverlay show={showCelebration} onComplete={handleCelebrationDone} />
    </GameShell>
  );
}
