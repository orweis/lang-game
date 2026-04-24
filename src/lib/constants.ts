export const CARD_VARIANTS = {
  idle: { scale: 1 },
  hover: { scale: 1.07 },
  tap: { scale: 0.9 },
  correct: { scale: [1, 1.3, 1], transition: { duration: 0.4 } },
  wrong: { x: [0, -12, 12, -10, 10, -6, 6, 0], transition: { duration: 0.5 } },
};

export const SPRING = { type: "spring" as const, stiffness: 400, damping: 30 };

export const CONFETTI_COLORS = [
  "#f87171", "#fb923c", "#fbbf24", "#4ade80",
  "#34d399", "#38bdf8", "#818cf8", "#e879f9",
  "#f472b6", "#facc15",
];

export const MODE_COLORS = {
  alphabet: { bg: "bg-yellow-400", hover: "hover:bg-yellow-300", text: "text-yellow-900" },
  match:    { bg: "bg-green-400",  hover: "hover:bg-green-300",  text: "text-green-900"  },
  quiz:     { bg: "bg-purple-400", hover: "hover:bg-purple-300", text: "text-purple-900" },
};
