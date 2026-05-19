"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "./CartProvider";

export default function FloatingCartSummary() {
  const { totalCount, openMiniCart } = useCart();

  const count = totalCount ?? 0;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          type="button"
          onClick={openMiniCart}
          className="floating-cart-summary flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/95 px-3 py-2 text-xs font-medium text-slate-50 shadow-lg shadow-black/50 hover:border-slate-500 hover:bg-slate-800/95"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px]">
            🛒
          </span>
          <span>
            Cart ·{" "}
            <span className="font-semibold">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
