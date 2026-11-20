/** A function returning a float in [0, 1), like `Math.random`. */
export type Rng = () => number;

/**
 * Returns a shuffled copy of `arr` (Fisher-Yates). The input is not modified.
 * Pass `rng` to make the result deterministic (useful in tests).
 */
export function shuffle<T>(arr: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns up to `n` distinct items picked at random from `arr`.
 * If `n` is larger than the array, every item is returned (in random order).
 */
export function pickRandom<T>(arr: readonly T[], n: number, rng: Rng = Math.random): T[] {
  return shuffle(arr, rng).slice(0, Math.max(0, n));
}

/**
 * Picks `count` random wrong answers for a quiz question: items whose id is
 * not `correctId` and that pass the optional `allow` filter.
 */
export function getDistractors<T extends { id: string }>(
  all: readonly T[],
  correctId: string,
  count: number,
  options: { rng?: Rng; allow?: (item: T) => boolean } = {}
): T[] {
  const { rng = Math.random, allow = () => true } = options;
  return pickRandom(
    all.filter((item) => item.id !== correctId && allow(item)),
    count,
    rng
  );
}

/**
 * Joins class names, skipping falsy values. This is a plain joiner: it does
 * not resolve conflicting Tailwind classes, so avoid passing two classes for
 * the same CSS property.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
