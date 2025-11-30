"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import SearchModal from "./SearchModal";

type SearchContextType = {
  openSearch: () => void;
};

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  thumbnailUrl?: string;
  price?: string | null;
};

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const openSearch = () => setOpen(true);
  const closeSearch = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setLoading(false);
  };

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === "k";
      if ((event.metaKey || event.ctrlKey) && isK) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Live product search (instant results while typing)
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        if (!process.env.NEXT_PUBLIC_WPGRAPHQL_ENDPOINT) {
          console.warn(
            "NEXT_PUBLIC_WPGRAPHQL_ENDPOINT is not defined – search will not work."
          );
          return;
        }

        setLoading(true);

        const graphQuery = `
          query SearchProducts($search: String!) {
            products(first: 10, where: { search: $search }) {
              nodes {
                id
                slug
                name
                ... on SimpleProduct { price }
                ... on VariableProduct { price }
                image {
                  sourceUrl
                  altText
                }
              }
            }
          }
        `;

        const res = await fetch(process.env.NEXT_PUBLIC_WPGRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: graphQuery,
            variables: { search: trimmed },
          }),
        });

        if (!res.ok) {
          throw new Error(`Network error: ${res.status}`);
        }

        const json = await res.json();
        if (cancelled) return;

        const nodes = (json?.data?.products?.nodes ?? []) as any[];

        const mapped: SearchResult[] = nodes.map((node) => ({
          id: node.id,
          slug: node.slug,
          name: node.name,
          thumbnailUrl: node.image?.sourceUrl ?? undefined,
          price: node.price ?? null,
        }));

        setResults(mapped);
      } catch (error) {
        console.error("Search error:", error);
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const handleSubmit = () => {
    if (!query.trim()) return;
    const q = query.trim();
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSelectResult = (slug: string) => {
    closeSearch();
    router.push(`/product/${slug}`);
  };

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}

      <SearchModal
        open={open}
        onOpenChange={(next: boolean) => {
          if (!next) {
            closeSearch();
          } else {
            setOpen(true);
          }
        }}
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        results={results}
        loading={loading}
        onSelectResult={handleSelectResult}
      />
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextType {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return ctx;
}

export default SearchProvider;