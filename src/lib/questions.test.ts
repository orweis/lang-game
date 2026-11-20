import { describe, expect, it } from "vitest";
import { ALPHABET, WORDS } from "@/data";
import { buildQuizQuestions } from "@/lib/questions";
import { seededRng } from "../../test/rng";

describe("buildQuizQuestions", () => {
  it("builds 15 questions, five of each type, with unique ids", () => {
    const qs = buildQuizQuestions({ rng: seededRng(1) });
    expect(qs).toHaveLength(15);
    for (const type of ["letter-to-name", "word-to-emoji", "sound-to-letter"]) {
      expect(qs.filter((q) => q.type === type)).toHaveLength(5);
    }
    expect(new Set(qs.map((q) => q.id)).size).toBe(15);
  });

  it("always offers the correct answer once among three distinct choices", () => {
    for (let seed = 0; seed < 40; seed++) {
      for (const q of buildQuizQuestions({ rng: seededRng(seed) })) {
        const ids = q.choices.map((c) => c.id);
        expect(ids).toHaveLength(3);
        expect(new Set(ids).size).toBe(3);
        expect(ids.filter((id) => id === q.correctId)).toHaveLength(1);
      }
    }
  });

  it("uses the right prompt and choice kind for each type", () => {
    const letterIds = new Set(ALPHABET.map((l) => l.id as string));
    const wordIds = new Set(WORDS.map((w) => w.id));
    for (const q of buildQuizQuestions({ rng: seededRng(9) })) {
      if (q.type === "word-to-emoji") {
        const word = WORDS.find((w) => w.id === q.correctId)!;
        expect(q.prompt).toBe(word.emoji);
        expect(q.ttsPrompt).toBe(word.ttsPhrase);
        q.choices.forEach((c) => expect(wordIds.has(c.id)).toBe(true));
      } else {
        const letter = ALPHABET.find((l) => l.id === q.correctId)!;
        expect(q.ttsPrompt).toBe(letter.ttsPhrase);
        expect(q.prompt).toBe(
          q.type === "letter-to-name" ? letter.letter : `"${letter.nameRomanized}" — ?`
        );
        q.choices.forEach((c) => expect(letterIds.has(c.id)).toBe(true));
      }
    }
  });

  it("never pairs letters that sound the same in sound-to-letter questions", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const q of buildQuizQuestions({ rng: seededRng(seed) })) {
        if (q.type !== "sound-to-letter") continue;
        const phonetics = q.choices.map((c) => ALPHABET.find((l) => l.id === c.id)!.phonetic);
        expect(new Set(phonetics).size).toBe(phonetics.length);
      }
    }
  });

  it("honours custom sizes", () => {
    const qs = buildQuizQuestions({ perType: 2, distractors: 3, rng: seededRng(5) });
    expect(qs).toHaveLength(6);
    qs.forEach((q) => expect(q.choices).toHaveLength(4));
  });

  it("is reproducible with the same seed and differs between seeds", () => {
    const a = buildQuizQuestions({ rng: seededRng(11) }).map((q) => q.id);
    const b = buildQuizQuestions({ rng: seededRng(11) }).map((q) => q.id);
    const c = buildQuizQuestions({ rng: seededRng(12) }).map((q) => q.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
});
