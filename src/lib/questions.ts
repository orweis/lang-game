import { ALPHABET, WORDS } from "@/data";
import { QUESTIONS_PER_TYPE, QUIZ_DISTRACTORS } from "@/lib/constants";
import { getDistractors, pickRandom, shuffle, type Rng } from "@/lib/utils";
import type { HebrewLetter, HebrewWord, QuizQuestion } from "@/types";

/**
 * Picks up to `count` letters that sound different from `correct` and from
 * each other, so a sound-to-letter question always has one clear answer.
 */
function pickDistinctSounding(
  letters: readonly HebrewLetter[],
  correct: HebrewLetter,
  count: number,
  rng: Rng
): HebrewLetter[] {
  const usedSounds = new Set([correct.phonetic]);
  const picked: HebrewLetter[] = [];
  for (const candidate of shuffle(letters, rng)) {
    if (picked.length >= count) break;
    if (usedSounds.has(candidate.phonetic)) continue;
    usedSounds.add(candidate.phonetic);
    picked.push(candidate);
  }
  return picked;
}

/**
 * Builds one quiz session: `perType` questions of each of the three types,
 * shuffled together.
 *
 * - letter-to-name: a letter glyph is shown; pick its name.
 * - word-to-emoji: an emoji is shown; pick the matching Hebrew word.
 * - sound-to-letter: a letter name is spoken; pick the letter glyph. Letters
 *   that sound the same (e.g. kaf/qof, tet/tav) are never offered together.
 */
export function buildQuizQuestions(
  options: {
    letters?: readonly HebrewLetter[];
    words?: readonly HebrewWord[];
    perType?: number;
    distractors?: number;
    rng?: Rng;
  } = {}
): QuizQuestion[] {
  const {
    letters = ALPHABET,
    words = WORDS,
    perType = QUESTIONS_PER_TYPE,
    distractors = QUIZ_DISTRACTORS,
    rng = Math.random,
  } = options;
  const questions: QuizQuestion[] = [];

  for (const letter of pickRandom(letters, perType, rng)) {
    const wrong = getDistractors(letters, letter.id, distractors, { rng });
    questions.push({
      id: `ltn-${letter.id}`,
      type: "letter-to-name",
      prompt: letter.letter,
      ttsPrompt: letter.ttsPhrase,
      correctId: letter.id,
      choices: shuffle([letter, ...wrong], rng),
    });
  }

  for (const word of pickRandom(words, perType, rng)) {
    const wrong = getDistractors(words, word.id, distractors, {
      rng,
      // Avoid two choices that look identical (same emoji).
      allow: (w) => w.emoji !== word.emoji,
    });
    questions.push({
      id: `wte-${word.id}`,
      type: "word-to-emoji",
      prompt: word.emoji,
      ttsPrompt: word.ttsPhrase,
      correctId: word.id,
      choices: shuffle([word, ...wrong], rng),
    });
  }

  for (const letter of pickRandom(letters, perType, rng)) {
    const wrong = pickDistinctSounding(letters, letter, distractors, rng);
    questions.push({
      id: `stl-${letter.id}`,
      type: "sound-to-letter",
      prompt: `"${letter.nameRomanized}" — ?`,
      ttsPrompt: letter.ttsPhrase,
      correctId: letter.id,
      choices: shuffle([letter, ...wrong], rng),
    });
  }

  return shuffle(questions, rng);
}
