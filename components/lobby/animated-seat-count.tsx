"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = {
  seatedCount: number;
  maxSeats: number;
};

export function AnimatedSeatCount({ seatedCount, maxSeats }: Props) {
  const reduceMotion = useReducedMotion();
  const value = `${seatedCount} / ${maxSeats}`;

  return (
    <span className="inline-block min-w-[5ch] tabular-nums">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          className="inline-block"
          initial={reduceMotion ? false : { opacity: 0, y: 4, scale: 0.98 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 1.02 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
