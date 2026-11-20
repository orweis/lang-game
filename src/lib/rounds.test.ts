import { describe, expect, it } from "vitest";
import { ALPHABET, WORDS } from "@/data";
import { buildMatchRounds } from "@/lib/rounds";
import type { HebrewWord, LetterId } from "@/types";
import { seededRng } from "../../test/rng";

const word = (id: string, firstLetter: LetterId): HebrewWord => ({
  id,
  word: id,
  meaning: id,
  ttsPhrase: id,
  emoji: "x",
  category: "object",
  firstLetter,
});

const LETTER_IDS = ALPHABET.map((l) => l.id);

describe("buildMatchRounds", () => {
  it("covers every letter that has a word exactly once, with matching pairs", () => {
    for (let seed = 0; seed < 25; seed++) {
      const rounds = buildMatchRounds({ rng: seededRng(seed) });
      const letters = rounds.flatMap((r) => r.letters.map((l) => l.id));
      expect(new Set(letters).size).toBe(letters.length);
      expect(new Set(letters)).toEqual(new Set(WORDS.map((w) => w.firstLetter)));

      for (const round of rounds) {
        expect(round.letters.length).toBe(round.words.length);
        expect(round.letters.length).toBeGreaterThanOrEqual(2);
        // Every word has exactly one matching letter in its round.
        const roundLetters = new Set(round.letters.map((l) => l.id));
        expect(new Set(round.words.map((w) => w.firstLetter))).toEqual(roundLetters);
      }
    }
  });

  it("varies which word represents a letter between sessions", () => {
    const alephWords = new Set<string>();
    for (let seed = 0; seed < 40; seed++) {
      const rounds = buildMatchRounds({ rng: seededRng(seed) });
      const w = rounds.flatMap((r) => r.words).find((x) => x.firstLetter === "aleph");
      alephWords.add(w!.id);
    }
    expect(alephWords.size).toBeGreaterThan(1);
  });

  it("merges a single leftover pair into the previous round instead of dropping it", () => {
    const words = LETTER_IDS.slice(0, 5).map((id) => word(`w-${id}`, id));
    const rounds = buildMatchRounds({ words, pairsPerRound: 4, rng: seededRng(1) });
    expect(rounds).toHaveLength(1);
    expect(rounds[0].letters).toHaveLength(5);
  });

  it("keeps a leftover of two or more pairs as its own round", () => {
    const words = LETTER_IDS.slice(0, 6).map((id) => word(`w-${id}`, id));
    const rounds = buildMatchRounds({ words, pairsPerRound: 4, rng: seededRng(1) });
    expect(rounds.map((r) => r.letters.length)).toEqual([4, 2]);
  });

  it("returns no rounds when fewer than two pairs exist", () => {
    expect(buildMatchRounds({ words: [] })).toEqual([]);
    expect(buildMatchRounds({ words: [word("solo", "bet")] })).toEqual([]);
  });

  it("ignores words whose letter is not in the letter list", () => {
    const letters = ALPHABET.filter((l) => l.id === "bet" || l.id === "gimel");
    const words = [word("a", "bet"), word("b", "gimel"), word("c", "dalet")];
    const rounds = buildMatchRounds({ letters, words, rng: seededRng(2) });
    expect(rounds.flatMap((r) => r.words.map((w) => w.id)).sort()).toEqual(["a", "b"]);
  });

  it("rejects rounds smaller than two pairs", () => {
    expect(() => buildMatchRounds({ pairsPerRound: 1 })).toThrow(RangeError);
  });
});
