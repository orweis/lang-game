/** Stable identifiers for the 22 letters of the Hebrew alphabet. */
export type LetterId =
  | "aleph"
  | "bet"
  | "gimel"
  | "dalet"
  | "he"
  | "vav"
  | "zayin"
  | "chet"
  | "tet"
  | "yod"
  | "kaf"
  | "lamed"
  | "mem"
  | "nun"
  | "samech"
  | "ayin"
  | "pe"
  | "tsadi"
  | "qof"
  | "resh"
  | "shin"
  | "tav";

export interface HebrewLetter {
  id: LetterId;
  /** The bare letter glyph, e.g. "א". */
  letter: string;
  /** The letter's Hebrew name, with niqqud. */
  name: string;
  nameRomanized: string;
  /** Rough English sound of the letter; letters sharing a value are easy to confuse by ear. */
  phonetic: string;
  /** Text handed to the speech synthesizer when the letter is tapped. */
  ttsPhrase: string;
  /** Tailwind background class for the letter's card. */
  color: string;
  /** 1-based position in the alphabet. */
  position: number;
}

export type WordCategory = "animal" | "food" | "body" | "family" | "object";

export interface HebrewWord {
  id: string;
  /** The word in Hebrew, with niqqud. */
  word: string;
  /** English meaning, for documentation and contributors. */
  meaning: string;
  ttsPhrase: string;
  emoji: string;
  category: WordCategory;
  /** The letter the word starts with (used by the match game). */
  firstLetter: LetterId;
}

export type QuizQuestionType =
  | "letter-to-name"
  | "word-to-emoji"
  | "sound-to-letter";

export type QuizChoiceItem = HebrewLetter | HebrewWord;

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  /** What is shown on screen as the question. */
  prompt: string;
  /** What is spoken aloud for the question. */
  ttsPrompt: string;
  correctId: string;
  choices: QuizChoiceItem[];
}

export interface MatchRound {
  letters: HebrewLetter[];
  words: HebrewWord[];
}
