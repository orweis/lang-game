export interface HebrewLetter {
  id: string;
  letter: string;
  name: string;
  nameRomanized: string;
  phonetic: string;
  ttsPhrase: string;
  color: string;
  position: number;
}

export interface HebrewWord {
  id: string;
  word: string;
  meaning: string;
  ttsPhrase: string;
  emoji: string;
  category: "animal" | "food" | "body" | "family" | "object";
  firstLetter: string;
}

export type QuizQuestionType =
  | "letter-to-name"
  | "word-to-emoji"
  | "sound-to-letter";

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  ttsPrompt: string;
  correctId: string;
  choices: Array<HebrewLetter | HebrewWord>;
}

export interface GameState {
  currentIndex: number;
  score: number;
  total: number;
  isComplete: boolean;
  lastAnswerCorrect: boolean | null;
}

export interface MatchPair {
  letter: HebrewLetter;
  word: HebrewWord;
  isMatched: boolean;
}
