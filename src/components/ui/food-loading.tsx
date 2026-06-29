"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Pizza,
  Beef,
  Coffee,
  CupSoda,
  Sandwich,
  IceCream,
  UtensilsCrossed,
} from "lucide-react";

const ICONS = [Pizza, Beef, Coffee, CupSoda, Sandwich, IceCream, UtensilsCrossed];

export function FoodLoading({ size = 40 }: { size?: number }) {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return; // no cycle icons if reduced motion
    const t = setInterval(() => setIndex((i) => (i + 1) % ICONS.length), 700);
    return () => clearInterval(t);
  }, [prefersReducedMotion]);

  const Icon = useMemo(() => ICONS[prefersReducedMotion ? 0 : index], [prefersReducedMotion, index]);

  return (
    <div className="flex items-center justify-center">
      {prefersReducedMotion ? (
        <div className="relative flex items-center justify-center">
          <Icon size={size} strokeWidth={1.6} className="text-[var(--neo-brand)]" />
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute -inset-2 rounded-full opacity-30 blur-sm" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent)' }} />
            <Icon size={size} strokeWidth={1.6} className="text-[var(--neo-brand)]" />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export function FoodPulseRow({ count = 3 }: { count?: number }) {
  const prefersReducedMotion = useReducedMotion();
  const icons = ICONS.slice(0, count);

  if (prefersReducedMotion) {
    return (
      <div className="flex items-center gap-3">
        {icons.map((Ico, i) => (
          <div key={i}>
            <Ico size={20} strokeWidth={1.6} className="text-[var(--neo-muted)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {icons.map((Ico, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0.8 }}
          animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.15 }}
        >
          <Ico size={20} strokeWidth={1.6} className="text-[var(--neo-muted)]" />
        </motion.div>
      ))}
    </div>
  );
}

export function FoodMini({ size = 14 }: { size?: number }) {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % ICONS.length), 500);
    return () => clearInterval(t);
  }, [prefersReducedMotion]);

  const Icon = ICONS[prefersReducedMotion ? 0 : index];

  if (prefersReducedMotion) {
    return (
      <span className="inline-flex items-center justify-center">
        <Icon size={size} strokeWidth={1.6} className="text-[var(--neo-muted)]" />
      </span>
    );
  }

  return (
    <motion.div
      initial={{ rotate: 0, scale: 0.9 }}
      animate={{ rotate: [0, 8, -6, 0], scale: [0.9, 1, 0.95, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
      className="inline-flex items-center justify-center"
    >
      <Icon size={size} strokeWidth={1.6} className="text-[var(--neo-muted)]" />
    </motion.div>
  );
}
