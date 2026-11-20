"use client";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/layout/GameShell";
import { MatchBoard } from "@/components/game/MatchBoard";
import { CelebrationOverlay } from "@/components/ui/CelebrationOverlay";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ResultScreen } from "@/components/ui/ResultScreen";
import { useIsClient } from "@/hooks/useIsClient";
import { buildMatchRounds } from "@/lib/rounds";
import { STRINGS } from "@/lib/strings";
import type { MatchRound } from "@/types";

interface MatchGameProps {
  /** Builds the rounds for a session. Defaults to random rounds of 4 pairs. */
  buildRounds?: () => MatchRound[];
}

/**
 * The match mode: several rounds of dragging letters onto words. A
 * celebration plays between rounds. "Play again" reshuffles the rounds.
 */
export function MatchGame({ buildRounds = buildMatchRounds }: MatchGameProps) {
  const isClient = useIsClient();
  const [session, setSession] = useState(0);
  const [rounds, setRounds] = useState<MatchRound[]>(buildRounds);
  const [roundIdx, setRoundIdx] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const done = roundIdx >= rounds.length;

  const handleRoundComplete = useCallback(() => setShowCelebration(true), []);

  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);
    setRoundIdx((i) => i + 1);
  }, []);

  const restart = () => {
    setRounds(buildRounds());
    setSession((s) => s + 1);
    setRoundIdx(0);
    setShowCelebration(false);
  };

  // Rounds are random, so they are only rendered in the browser.
  if (!isClient) return <GameShell title={STRINGS.matchTitle}>{null}</GameShell>;

  if (done) {
    return (
      <ResultScreen
        emoji="🏆"
        title={STRINGS.praiseExclaim}
        subtitle={`השלמת ${rounds.length} סיבובים!`}
        onRestart={restart}
        buttonClassName="bg-green-400 hover:bg-green-300"
      />
    );
  }

  const { letters, words } = rounds[roundIdx];

  return (
    <GameShell title={STRINGS.matchTitle}>
      <ProgressBar current={roundIdx} total={rounds.length} />
      <p className="text-center text-slate-500 text-xl mb-4 font-bold">
        {STRINGS.matchInstructions}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${session}-${roundIdx}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
        >
          <MatchBoard letters={letters} words={words} onRoundComplete={handleRoundComplete} />
        </motion.div>
      </AnimatePresence>
      <CelebrationOverlay show={showCelebration} onComplete={handleCelebrationDone} />
    </GameShell>
  );
}
