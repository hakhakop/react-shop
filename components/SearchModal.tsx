"use client";

import {
  useEffect,
  useRef,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string;
  price?: string | null;
};

type SearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  results: SearchResult[];
  loading: boolean;
  onSelectResult: (slug: string) => void;
};

export default function SearchModal({
  open,
  onOpenChange,
  query,
  onQueryChange,
  onSubmit,
  results,
  loading,
  onSelectResult,
}: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleBackdropClick = () => {
    onOpenChange(false);
  };

  const handleContentClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!results.length) {
        e.preventDefault();
        onSubmit();
      }
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-3 py-12 backdrop-blur-sm"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/95 shadow-2xl shadow-black/70"
            onClick={handleContentClick}
            initial={{ y: 20, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Search
                </span>
                <span className="text-xs text-slate-500">
                  Start typing to see instant results. Press Enter for full
                  search.
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
              >
                Esc
              </button>
            </div>

            {/* Input */}
            <div className="px-4 pb-3 pt-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 shadow-inner shadow-black/40">
                <span className="text-slate-400 text-sm">⌘K</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products, categories, brands..."
                  className="h-7 w-full bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Press <span className="font-semibold text-slate-200">Enter</span>{" "}
                  to open the full search page.
                </span>
                <span className="hidden md:inline">
                  Or select a product from instant results.
                </span>
              </div>
            </div>

            {/* Results */}
            <div className="border-t border-slate-800/70 px-2 pb-2 pt-1">
              {loading && (
                <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400">
                  <span className="inline-block h-2 w-2 animate-ping rounded-full bg-slate-400" />
                  <span>Searching…</span>
                </div>
              )}

              {!loading && query.trim().length >= 2 && !results.length && (
                <div className="px-2 py-2 text-[11px] text-slate-500">
                  No results found. Try a different keyword.
                </div>
              )}

              {!loading && !!results.length && (
                <ul className="max-h-72 space-y-1 overflow-y-auto py-1">
                  {results.map((item) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.12 }}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectResult(item.slug)}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-slate-100 hover:bg-slate-800/70"
                      >
                        {item.thumbnailUrl && (
                          <div className="relative h-9 w-9 overflow-hidden rounded-md border border-slate-800/80 bg-slate-900/80">
                            <img
                              src={item.thumbnailUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-medium leading-tight line-clamp-2">
                            {item.name}
                          </span>
                          {item.price && (
                            <span className="text-[11px] text-slate-400">
                              {item.price}
                            </span>
                          )}
                        </div>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}