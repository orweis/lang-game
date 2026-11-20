"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const MODES = [
  {
    href: "/alphabet",
    emoji: "🔤",
    label: "אָלֶף-בֵּית",
    sublabel: "Aleph-Bet",
    bg: "bg-yellow-400",
    hover: "hover:bg-yellow-300",
    shadow: "shadow-yellow-300",
    delay: 0,
  },
  {
    href: "/match",
    emoji: "🧩",
    label: "הַתְאֵם",
    sublabel: "Match",
    bg: "bg-green-400",
    hover: "hover:bg-green-300",
    shadow: "shadow-green-300",
    delay: 0.1,
  },
  {
    href: "/quiz",
    emoji: "❓",
    label: "חִידוֹן",
    sublabel: "Quiz",
    bg: "bg-purple-400",
    hover: "hover:bg-purple-300",
    shadow: "shadow-purple-300",
    delay: 0.2,
  },
];

export function HomeScreen() {
  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center mb-12"
      >
        <div className="text-7xl mb-3" aria-hidden>
          🌟
        </div>
        <h1 className="text-5xl font-black text-slate-800 leading-tight">
          לומדים עברית!
        </h1>
        <p className="text-2xl text-slate-600 mt-2 font-bold">
          Let&apos;s Learn Hebrew
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
        {MODES.map((mode) => (
          <motion.div
            key={mode.href}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: mode.delay,
            }}
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.05 }}
            className="flex-1"
          >
            <Link
              href={mode.href}
              className={`flex flex-col items-center justify-center gap-3 w-full min-h-[160px] rounded-3xl shadow-lg ${mode.bg} ${mode.hover} transition-colors duration-150 p-6`}
              aria-label={mode.label}
            >
              <span className="text-6xl" aria-hidden>
                {mode.emoji}
              </span>
              <span className="text-3xl font-black text-white">{mode.label}</span>
              <span className="text-lg font-bold text-white/80">{mode.sublabel}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
