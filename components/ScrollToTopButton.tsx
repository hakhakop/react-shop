"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setVisible(y > 400); // show after 400px scroll
    };

    handleScroll(); // run once on mount
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    if (typeof window === "undefined") return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          className="scroll-to-top-button flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-slate-50 shadow-lg shadow-black/50 hover:border-slate-500 hover:bg-slate-800/95"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          aria-label="Scroll to top"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px]">
            ↑
          </span>
          <span className="hidden sm:inline">Back to top</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
