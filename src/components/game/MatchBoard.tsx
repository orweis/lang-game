"use client";
import { useCallback, useEffect, useState } from "react";
import { useAudio } from "@/hooks/useAudio";
import { useDragTouch } from "@/hooks/useDragTouch";
import { MatchCard } from "./MatchCard";
import { DropZone } from "./DropZone";
import type { HebrewLetter, HebrewWord } from "@/types";

interface MatchBoardProps {
  letters: HebrewLetter[];
  words: HebrewWord[];
  onRoundComplete: () => void;
}

export function MatchBoard({ letters, words, onRoundComplete }: MatchBoardProps) {
  const { speak } = useAudio();
  const [matched, setMatched] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMatched(new Set());
  }, [letters]);

  const handleDrop = useCallback(
    (draggedLetterId: string, dropEl: Element | null) => {
      if (!dropEl) return;
      const dropZoneId = dropEl.getAttribute("data-dropzone");
      if (!dropZoneId) return;

      const letter = letters.find((l) => l.id === draggedLetterId);
      const word = words.find((w) => w.id === dropZoneId);
      if (!letter || !word) return;

      if (word.firstLetter === draggedLetterId) {
        const newMatched = new Set(matched);
        newMatched.add(draggedLetterId);
        setMatched(newMatched);
        speak("כָּל הַכָּבוֹד");
        if (newMatched.size === letters.length) {
          setTimeout(onRoundComplete, 800);
        }
      } else {
        speak("נסה שוב");
      }
    },
    [letters, words, matched, speak, onRoundComplete]
  );

  const { drag, dragOffset, onPointerDown, onPointerMove, onPointerUp } =
    useDragTouch(handleDrop);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Letter column (right in RTL) */}
      <div className="flex flex-col gap-3">
        {letters.map((letter) => (
          <MatchCard
            key={letter.id}
            letter={letter}
            isMatched={matched.has(letter.id)}
            isDragging={drag.draggedId === letter.id}
            dragOffset={drag.draggedId === letter.id ? dragOffset : { x: 0, y: 0 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        ))}
      </div>

      {/* Word/drop-zone column (left in RTL) */}
      <div className="flex flex-col gap-3">
        {words.map((word) => {
          const matchedLetter = letters.find(
            (l) => l.id === word.firstLetter && matched.has(l.id)
          );
          return (
            <DropZone
              key={word.id}
              word={word}
              isMatched={!!matchedLetter}
              dropZoneId={word.id}
            />
          );
        })}
      </div>
    </div>
  );
}
