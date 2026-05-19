"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useRecentlyViewed } from "./RecentlyViewedProvider";

const subscribeToHydration = (callback: () => void) => {
  window.queueMicrotask(callback);
  return () => {};
};

const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

function useHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  );
}

export default function RecentlyViewedStrip() {
  const { items, clear, storageReady } = useRecentlyViewed();
  const hydrated = useHydrated();

  if (!hydrated || !storageReady || !items.length) {
    return null;
  }

  return (
    <section className="recently-viewed-section border-b border-slate-800/60 bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
        {/* Title + subtitle */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-300">
              Recently viewed
            </span>
            <span className="text-[11px] text-slate-500">
              You looked at these products recently.
            </span>
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={clear}
          className="self-start rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] text-slate-400 hover:border-slate-700 hover:bg-slate-800 md:self-center"
        >
          Clear
        </button>
      </div>

      <div className="mx-auto max-w-6xl overflow-x-auto px-3 pb-3 md:px-6">
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id || item.slug}
              className="min-w-[160px] max-w-[180px] flex-1 cursor-pointer rounded-xl border border-slate-800/90 bg-slate-950/90 px-2 py-2 shadow-sm shadow-black/40 hover:border-slate-600 hover:bg-slate-900/90"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <Link
                href={`/product/${item.slug}`}
                className="flex flex-col gap-1"
              >
                {item.thumbnailUrl && (
                  <div className="mb-1 aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-800/80 bg-slate-900/80">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-0.5">
                  <span className="line-clamp-2 text-[12px] font-medium text-slate-100">
                    {item.name}
                  </span>
                  {item.price && (
                    <span className="text-[11px] text-slate-400">
                      {item.price}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
