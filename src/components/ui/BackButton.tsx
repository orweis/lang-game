"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export function BackButton() {
  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      className="fixed top-4 right-4 z-50"
    >
      <Link
        href="/"
        aria-label="חזור לתפריט הראשי"
        className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg text-3xl select-none"
      >
        🏠
      </Link>
    </motion.div>
  );
}
