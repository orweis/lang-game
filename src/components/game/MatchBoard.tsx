"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "@/hooks/useAudio";
import { useDragTouch } from "@/hooks/useDragTouch";
import { TIMING } from "@/lib/constants";
import { STRINGS } from "@/lib/strings";
import { MatchCard } from "./MatchCard";
import { DropZone } from "./DropZone";
import type { HebrewLetter, HebrewWord } from "@/types";

interface MatchBoardProps {
  letters: HebrewLetter[];
  words: HebrewWord[];
  /** Called once, shortly after the last pair in the round is matched. */
  onRoundComplete: () => void;
}

/**
 * One round of the match game: drag each letter onto the word that starts
 * with it. Keyboard users can select a letter with Enter/Space and then
 * activate a word. Render with a new `key` for each round.
 */
export function MatchBoard({ letters, words, onRoundComplete }: MatchBoardProps) {
  const { speak } = useAudio();
  const [matched, setMatched] = useState<ReadonlySet<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  // Source of truth for event handlers, so quick successive drops never read stale state.
  const matchedRef = useRef<ReadonlySet<string>>(matched);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (completeTimer.current) clearTimeout(completeTimer.current);
    },
    []
  );

  const tryMatch = useCallback(
    (letterId: string, wordId: string) => {
      const word = words.find((w) => w.id === wordId);
      const letter = letters.find((l) => l.id === letterId);
      if (!letter || !word || matchedRef.current.has(letterId)) return;

      if (word.firstLetter !== letterId) {
        speak(STRINGS.tryAgain);
        setAnnouncement(STRINGS.tryAgain);
        return;
      }

      const next = new Set(matchedRef.current).add(letterId);
      matchedRef.current = next;
      setMatched(next);
      speak(STRINGS.praise);
      setAnnouncement(STRINGS.praiseExclaim);
      if (next.size === letters.length) {
        completeTimer.current = setTimeout(onRoundComplete, TIMING.matchRoundComplete);
      }
    },
    [letters, words, speak, onRoundComplete]
  );

  const handleDrop = useCallback(
    (draggedLetterId: string, dropEl: Element | null) => {
      const dropZoneId = dropEl?.getAttribute("data-dropzone");
      if (dropZoneId) tryMatch(draggedLetterId, dropZoneId);
    },
    [tryMatch]
  );

  const handleActivateZone = useCallback(
    (wordId: string) => {
      if (!selectedId) return;
      setSelectedId(null);
      tryMatch(selectedId, wordId);
    },
    [selectedId, tryMatch]
  );

  const { drag, dragOffset, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } =
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
            isSelected={selectedId === letter.id}
            dragOffset={drag.draggedId === letter.id ? dragOffset : { x: 0, y: 0 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
          />
        ))}
      </div>

      {/* Word/drop-zone column (left in RTL) */}
      <div className="flex flex-col gap-3">
        {words.map((word) => (
          <DropZone
            key={word.id}
            word={word}
            isMatched={matched.has(word.firstLetter)}
            dropZoneId={word.id}
            onActivate={handleActivateZone}
          />
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
