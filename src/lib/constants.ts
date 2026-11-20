/** Colours used for the confetti pieces in the celebration overlay. */
export const CONFETTI_COLORS = [
  "#f87171", "#fb923c", "#fbbf24", "#4ade80",
  "#34d399", "#38bdf8", "#818cf8", "#e879f9",
  "#f472b6", "#facc15",
] as const;

/** Number of letter/word pairs shown in one round of the match game. */
export const PAIRS_PER_ROUND = 4;

/** Questions of each type in one quiz session (3 types, so 15 questions in total). */
export const QUESTIONS_PER_TYPE = 5;

/** Number of wrong options shown next to the right answer in the quiz. */
export const QUIZ_DISTRACTORS = 2;

/** Timings (ms) for game feedback. */
export const TIMING = {
  /** Delay before the quiz question is read aloud. */
  quizPromptDelay: 500,
  /** How long the correct/wrong colours stay on screen before the quiz moves on. */
  quizFeedback: 2000,
  /** Extra pause after a wrong quiz answer before the next question. */
  quizWrongPause: 2000,
  /** Delay between the last match and the round-complete celebration. */
  matchRoundComplete: 800,
  /** How long the celebration overlay is shown. */
  celebration: 2200,
  /** Gap between letters in "play all" on the alphabet screen. */
  playAllStep: 1600,
} as const;
