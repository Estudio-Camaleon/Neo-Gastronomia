"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function WelcomeToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-sm tracking-tight">
              ¡Bienvenido a NEO!
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
