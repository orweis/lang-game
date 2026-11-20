import { outOf } from "@/lib/strings";

interface ProgressBarProps {
  current: number;
  total: number;
}

/** A row of stars: one filled star per completed step. */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = Math.max(0, Math.floor(total));
  const done = Math.min(Math.max(0, current), safeTotal);
  return (
    <div
      className="flex flex-wrap gap-2 justify-center py-2"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={done}
      aria-label={outOf(done, safeTotal)}
    >
      {Array.from({ length: safeTotal }, (_, i) => (
        <span key={i} className="text-2xl" aria-hidden>
          {i < done ? "⭐" : "⬜"}
        </span>
      ))}
    </div>
  );
}
