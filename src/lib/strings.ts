/** Hebrew UI strings shared by several screens. */
export const STRINGS = {
  praise: "כָּל הַכָּבוֹד",
  praiseExclaim: "כָּל הַכָּבוֹד!",
  tryAgain: "נסה שוב",
  playAgain: "שחק שוב",
  listenAgain: "האזן שוב",
  listen: "שמע",
  backToMenu: "חזור לתפריט הראשי",
  stop: "עצור",
  playAll: "נגן הכל",
  playAllLabel: "נגן את כל האותיות",
  finished: "סיימת!",
  matchInstructions: "גרור את האות למילה המתאימה",
  alphabetTitle: "🔤 אָלֶף-בֵּית",
  matchTitle: "🧩 הַתְאֵם",
  quizTitle: "❓ חִידוֹן",
} as const;

/** "X out of Y" in Hebrew. */
export function outOf(current: number, total: number): string {
  return `${current} מתוך ${total}`;
}
