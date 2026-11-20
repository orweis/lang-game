"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CONFETTI_COLORS, TIMING } from "@/lib/constants";

interface CelebrationOverlayProps {
  show: boolean;
  /** Called once, `TIMING.celebration` ms after `show` becomes true. */
  onComplete?: () => void;
}

const pieces = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: Math.random() * 0.4,
  rotate: Math.random() * 720 - 360,
  size: 10 + Math.random() * 12,
}));

/** Full-screen confetti and a star, shown after a correct answer or round. */
export function CelebrationOverlay({ show, onComplete }: CelebrationOverlayProps) {
  // Keep the latest callback without restarting the timer on every re-render.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onCompleteRef.current?.(), TIMING.celebration);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-testid="celebration"
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden
        >
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${p.x}%`,
                top: "-20px",
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0, scale: 0 }}
              animate={{
                y: "110vh",
                opacity: [1, 1, 0],
                rotate: p.rotate,
                scale: [0, 1, 0.6],
              }}
              transition={{ duration: 2, delay: p.delay, ease: "easeOut" }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-8xl"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              ⭐
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
