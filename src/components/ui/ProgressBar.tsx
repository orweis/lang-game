interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div
      className="flex flex-wrap gap-2 justify-center py-2"
      aria-label={`${current} מתוך ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="text-2xl" role="img" aria-hidden>
          {i < current ? "⭐" : "⬜"}
        </span>
      ))}
    </div>
  );
}
