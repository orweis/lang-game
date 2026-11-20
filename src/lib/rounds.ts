import { ALPHABET, WORDS } from "@/data";
import { PAIRS_PER_ROUND } from "@/lib/constants";
import { shuffle, type Rng } from "@/lib/utils";
import type { HebrewLetter, HebrewWord, MatchRound } from "@/types";

interface Pair {
  letter: HebrewLetter;
  word: HebrewWord;
}

/**
 * Builds the rounds of the drag-and-drop match game.
 *
 * Each word is paired with the letter it starts with. Only one word per
 * letter is used (picked at random) so that every drop target has exactly one
 * correct letter. Pairs are split into rounds of `pairsPerRound`; a leftover
 * single pair is merged into the previous round instead of being dropped, so
 * every eligible letter is reachable. Letters and words inside a round are
 * shuffled independently.
 */
export function buildMatchRounds(
  options: {
    letters?: readonly HebrewLetter[];
    words?: readonly HebrewWord[];
    pairsPerRound?: number;
    rng?: Rng;
  } = {}
): MatchRound[] {
  const {
    letters = ALPHABET,
    words = WORDS,
    pairsPerRound = PAIRS_PER_ROUND,
    rng = Math.random,
  } = options;
  if (pairsPerRound < 2) throw new RangeError("pairsPerRound must be at least 2");

  const letterById = new Map(letters.map((l) => [l.id, l]));
  const seen = new Set<string>();
  const pairs: Pair[] = [];
  for (const word of shuffle(words, rng)) {
    const letter = letterById.get(word.firstLetter);
    if (!letter || seen.has(letter.id)) continue;
    seen.add(letter.id);
    pairs.push({ letter, word });
  }

  const chunks: Pair[][] = [];
  for (let i = 0; i < pairs.length; i += pairsPerRound) {
    chunks.push(pairs.slice(i, i + pairsPerRound));
  }
  const last = chunks.at(-1);
  if (last && last.length < 2) {
    chunks.pop();
    if (chunks.length > 0) chunks[chunks.length - 1].push(...last);
  }

  return chunks.map((chunk) => ({
    letters: shuffle(
      chunk.map((p) => p.letter),
      rng
    ),
    words: shuffle(
      chunk.map((p) => p.word),
      rng
    ),
  }));
}
