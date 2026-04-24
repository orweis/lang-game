"use client";
import { useCallback, useState } from "react";
import type { GameState } from "@/types";

export function useGameState(total: number) {
  const [state, setState] = useState<GameState>({
    currentIndex: 0,
    score: 0,
    total,
    isComplete: false,
    lastAnswerCorrect: null,
  });

  const answer = useCallback(
    (correct: boolean) => {
      setState((prev) => {
        const newScore = prev.score + (correct ? 1 : 0);
        const nextIndex = prev.currentIndex + 1;
        return {
          ...prev,
          score: newScore,
          lastAnswerCorrect: correct,
          currentIndex: nextIndex,
          isComplete: nextIndex >= prev.total,
        };
      });
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      currentIndex: 0,
      score: 0,
      total,
      isComplete: false,
      lastAnswerCorrect: null,
    });
  }, [total]);

  return { state, answer, reset };
}
