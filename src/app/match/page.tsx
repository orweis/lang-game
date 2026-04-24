"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/layout/GameShell";
import { MatchBoard } from "@/components/game/MatchBoard";
import { CelebrationOverlay } from "@/components/ui/CelebrationOverlay";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BigButton } from "@/components/ui/BigButton";
import { ALPHABET, WORDS } from "@/data";
import { shuffle } from "@/lib/utils";
import type { HebrewLetter, HebrewWord } from "@/types";

const PAIRS_PER_ROUND = 4;

function buildRounds(): Array<{ letters: HebrewLetter[]; words: HebrewWord[] }> {
  // Build pairs: word → its starting letter
  const validPairs: Array<{ letter: HebrewLetter; word: HebrewWord }> = [];
  for (const word of WORDS) {
    const letter = ALPHABET.find((l) => l.id === word.firstLetter);
    if (letter) validPairs.push({ letter, word });
  }

  // Deduplicate letters — keep only one word per letter for clean matching
  const seen = new Set<string>();
  const uniquePairs = validPairs.filter(({ letter }) => {
    if (seen.has(letter.id)) return false;
    seen.add(letter.id);
    return true;
  });

  const shuffled = shuffle(uniquePairs);
  const rounds: Array<{ letters: HebrewLetter[]; words: HebrewWord[] }> = [];

  for (let i = 0; i < shuffled.length; i += PAIRS_PER_ROUND) {
    const chunk = shuffled.slice(i, i + PAIRS_PER_ROUND);
    if (chunk.length < 2) break;
    const letters = shuffle(chunk.map((p) => p.letter));
    const words = shuffle(chunk.map((p) => p.word));
    rounds.push({ letters, words });
  }
  return rounds;
}

export default function MatchPage() {
  const rounds = useMemo(() => buildRounds(), []);
  const [roundIdx, setRoundIdx] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [done, setDone] = useState(false);

  const handleRoundComplete = () => {
    setShowCelebration(true);
  };

  const handleCelebrationDone = () => {
    setShowCelebration(false);
    const next = roundIdx + 1;
    if (next >= rounds.length) {
      setDone(true);
    } else {
      setRoundIdx(next);
    }
  };

  const restart = () => {
    setRoundIdx(0);
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
            <div className="text-8xl mb-4">🏆</div>
            <h2 className="text-5xl font-black text-slate-800">כָּל הַכָּבוֹד!</h2>
            <p className="text-3xl font-bold text-slate-600 mt-3">
              השלמת {rounds.length} סיבובים!
            </p>
          </motion.div>
          <BigButton
            onClick={restart}
            className="bg-green-400 text-white hover:bg-green-300 text-3xl py-6 px-10"
            aria-label="שחק שוב"
          >
            🔄 שחק שוב
          </BigButton>
        </div>
      </GameShell>
    );
  }

  const { letters, words } = rounds[roundIdx];

  return (
    <GameShell title="🧩 הַתְאֵם">
      <ProgressBar current={roundIdx} total={rounds.length} />
      <p className="text-center text-slate-500 text-xl mb-4 font-bold">
        גרור את האות למילה המתאימה
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={roundIdx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
        >
          <MatchBoard
            letters={letters}
            words={words}
            onRoundComplete={handleRoundComplete}
          />
        </motion.div>
      </AnimatePresence>
      <CelebrationOverlay show={showCelebration} onComplete={handleCelebrationDone} />
    </GameShell>
  );
}
