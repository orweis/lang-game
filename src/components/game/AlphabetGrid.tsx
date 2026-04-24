"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LetterCard } from "./LetterCard";
import { BigButton } from "@/components/ui/BigButton";
import { useAudio } from "@/hooks/useAudio";
import { ALPHABET } from "@/data";

export function AlphabetGrid() {
  const { speak, isSpeaking } = useAudio();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playAllRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playAllIdxRef = useRef(0);

  const handleLetterTap = (id: string, ttsPhrase: string) => {
    if (isPlayingAll) return;
    setPlayingId(id);
    speak(ttsPhrase);
  };

  useEffect(() => {
    if (!isSpeaking && playingId && !isPlayingAll) {
      const t = setTimeout(() => setPlayingId(null), 300);
      return () => clearTimeout(t);
    }
  }, [isSpeaking, playingId, isPlayingAll]);

  const startPlayAll = () => {
    setIsPlayingAll(true);
    playAllIdxRef.current = 0;
    playNext(0);
  };

  const playNext = (idx: number) => {
    if (idx >= ALPHABET.length) {
      setIsPlayingAll(false);
      setPlayingId(null);
      return;
    }
    const letter = ALPHABET[idx];
    setPlayingId(letter.id);
    speak(letter.ttsPhrase);
    playAllRef.current = setTimeout(() => {
      playNext(idx + 1);
    }, 1600);
  };

  const stopPlayAll = () => {
    if (playAllRef.current) clearTimeout(playAllRef.current);
    setIsPlayingAll(false);
    setPlayingId(null);
    window.speechSynthesis?.cancel();
  };

  useEffect(() => {
    return () => {
      if (playAllRef.current) clearTimeout(playAllRef.current);
    };
  }, []);

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
              onClick={() => handleLetterTap(letter.id, letter.ttsPhrase)}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="flex justify-center mt-8">
        {isPlayingAll ? (
          <BigButton
            onClick={stopPlayAll}
            className="bg-red-400 text-white hover:bg-red-300"
            aria-label="עצור"
          >
            ⏹ עצור
          </BigButton>
        ) : (
          <BigButton
            onClick={startPlayAll}
            className="bg-blue-400 text-white hover:bg-blue-300"
            aria-label="נגן את כל האותיות"
          >
            ▶ נגן הכל
          </BigButton>
        )}
      </div>
    </div>
  );
}
