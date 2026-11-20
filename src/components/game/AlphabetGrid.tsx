"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LetterCard } from "./LetterCard";
import { BigButton } from "@/components/ui/BigButton";
import { useAudio } from "@/hooks/useAudio";
import { ALPHABET } from "@/data";
import { TIMING } from "@/lib/constants";
import { STRINGS } from "@/lib/strings";
import type { HebrewLetter } from "@/types";

/**
 * The alphabet explorer: tap a letter to hear it, or play all 22 letters in
 * order. While "play all" runs, single taps are ignored.
 */
export function AlphabetGrid() {
  const { speak, stop, isSpeaking } = useAudio();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playAllTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPlayAllTimer = () => {
    if (playAllTimer.current) clearTimeout(playAllTimer.current);
    playAllTimer.current = null;
  };

  // Clear the highlight shortly after a single letter finishes speaking.
  useEffect(() => {
    if (!isSpeaking && playingId && !isPlayingAll) {
      const t = setTimeout(() => setPlayingId(null), 300);
      return () => clearTimeout(t);
    }
  }, [isSpeaking, playingId, isPlayingAll]);

  useEffect(() => clearPlayAllTimer, []);

  const handleLetterTap = (letter: HebrewLetter) => {
    if (isPlayingAll) return;
    setPlayingId(letter.id);
    speak(letter.ttsPhrase);
  };

  const playFrom = (idx: number) => {
    if (idx >= ALPHABET.length) {
      setIsPlayingAll(false);
      setPlayingId(null);
      return;
    }
    const letter = ALPHABET[idx];
    setPlayingId(letter.id);
    speak(letter.ttsPhrase);
    playAllTimer.current = setTimeout(() => playFrom(idx + 1), TIMING.playAllStep);
  };

  const startPlayAll = () => {
    clearPlayAllTimer();
    setIsPlayingAll(true);
    playFrom(0);
  };

  const stopPlayAll = () => {
    clearPlayAllTimer();
    setIsPlayingAll(false);
    setPlayingId(null);
    stop();
  };

  return (
    <div>
      <motion.div
        className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.03 } },
        }}
      >
        {ALPHABET.map((letter) => (
          <motion.div
            key={letter.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <LetterCard
              letter={letter}
              isPlaying={playingId === letter.id}
              onClick={() => handleLetterTap(letter)}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="flex justify-center mt-8">
        {isPlayingAll ? (
          <BigButton
            onClick={stopPlayAll}
            className="bg-red-400 text-white hover:bg-red-300"
            aria-label={STRINGS.stop}
          >
            ⏹ {STRINGS.stop}
          </BigButton>
        ) : (
          <BigButton
            onClick={startPlayAll}
            className="bg-blue-400 text-white hover:bg-blue-300"
            aria-label={STRINGS.playAllLabel}
          >
            ▶ {STRINGS.playAll}
          </BigButton>
        )}
      </div>
    </div>
  );
}
