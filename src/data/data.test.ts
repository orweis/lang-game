import { describe, expect, it } from "vitest";
import { ALPHABET, WORDS } from "@/data";

/** Removes Hebrew niqqud and cantillation marks. */
const stripNiqqud = (s: string) => s.replace(/[֑-ׇ]/g, "");

describe("ALPHABET", () => {
  it("has the 22 letters in order, with positions 1..22", () => {
    expect(ALPHABET).toHaveLength(22);
    expect(ALPHABET.map((l) => l.position)).toEqual(
      Array.from({ length: 22 }, (_, i) => i + 1)
    );
    expect(ALPHABET.map((l) => l.letter).join("")).toBe("אבגדהוזחטיכלמנסעפצקרשת");
  });

  it("has unique ids, glyphs and colours", () => {
    for (const key of ["id", "letter", "color"] as const) {
      const values = ALPHABET.map((l) => l[key]);
      expect(new Set(values).size, key).toBe(values.length);
    }
  });

  it.each(ALPHABET.map((l) => [l.id, l] as const))("%s is well formed", (_, letter) => {
    expect(letter.letter).toMatch(/^[א-ת]$/);
    // The name starts with the letter itself.
    expect(stripNiqqud(letter.name)[0]).toBe(letter.letter);
    // The spoken phrase is "<glyph>, <name>".
    expect(letter.ttsPhrase).toBe(`${letter.letter}, ${letter.name}`);
    expect(letter.nameRomanized).toMatch(/^[A-Z][a-z]+$/);
    expect(letter.phonetic.trim()).not.toBe("");
    expect(letter.color).toMatch(/^bg-[a-z]+-\d{3}$/);
  });
});

describe("WORDS", () => {
  const letterById = new Map(ALPHABET.map((l) => [l.id, l]));

  it("has unique ids and words", () => {
    expect(new Set(WORDS.map((w) => w.id)).size).toBe(WORDS.length);
    expect(new Set(WORDS.map((w) => w.word)).size).toBe(WORDS.length);
  });

  it.each(WORDS.map((w) => [w.id, w] as const))("%s is well formed", (_, word) => {
    const letter = letterById.get(word.firstLetter);
    expect(letter, `unknown letter ${word.firstLetter}`).toBeDefined();
    // firstLetter must really be the first letter of the word.
    expect(stripNiqqud(word.word)[0]).toBe(letter!.letter);
    expect(word.ttsPhrase).toBe(word.word);
    expect(word.emoji.trim()).not.toBe("");
    expect(word.meaning.trim()).not.toBe("");
    expect(["animal", "food", "body", "family", "object"]).toContain(word.category);
  });

  it("covers enough distinct letters for at least two match rounds", () => {
    const letters = new Set(WORDS.map((w) => w.firstLetter));
    expect(letters.size).toBeGreaterThanOrEqual(8);
  });
});
