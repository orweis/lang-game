import { ALPHABET, WORDS } from "@/data";
import type { HebrewLetter, HebrewWord, QuizQuestion } from "@/types";

export const letter = (id: string): HebrewLetter => ALPHABET.find((l) => l.id === id)!;
export const word = (id: string): HebrewWord => WORDS.find((w) => w.id === id)!;

export const LETTER_Q: QuizQuestion = {
  id: "ltn-bet",
  type: "letter-to-name",
  prompt: "ב",
  ttsPrompt: letter("bet").ttsPhrase,
  correctId: "bet",
  choices: [letter("gimel"), letter("bet"), letter("dalet")],
};

export const WORD_Q: QuizQuestion = {
  id: "wte-cat",
  type: "word-to-emoji",
  prompt: "🐱",
  ttsPrompt: word("cat").ttsPhrase,
  correctId: "cat",
  choices: [word("dog"), word("cat"), word("fish")],
};

export const SOUND_Q: QuizQuestion = {
  id: "stl-mem",
  type: "sound-to-letter",
  prompt: '"Mem" — ?',
  ttsPrompt: letter("mem").ttsPhrase,
  correctId: "mem",
  choices: [letter("mem"), letter("nun"), letter("resh")],
};
