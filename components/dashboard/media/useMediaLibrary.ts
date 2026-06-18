"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WordPressMediaItem } from "@/components/dashboard/builderTypes";

export type MediaLibraryFilter = "all" | "image" | "documents" | "videos";

type MediaLibraryResponse = {
  media?: WordPressMediaItem[];
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  page?: number;
  message?: string;
};

const DEFAULT_PER_PAGE = 40;

function mergeMedia(
  current: WordPressMediaItem[],
  incoming: WordPressMediaItem[],
) {
  const seen = new Set(current.map((item) => item.id));
  const next = [...current];
  incoming.forEach((item) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      next.push(item);
    }
  });
  return next;
}

export function useMediaLibrary({
  open,
  perPage = DEFAULT_PER_PAGE,
}: {
  open: boolean;
  perPage?: number;
}) {
  const [items, setItems] = useState<WordPressMediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WordPressMediaItem | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MediaLibraryFilter>("image");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Browse WordPress media");
  const abortRef = useRef<AbortController | null>(null);

  const clientFilteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.title, item.altText, item.filename, item.caption, item.description]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [items, search]);

  const fetchPage = useCallback(
    async (nextPage: number, mode: "replace" | "append" = "replace") => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setError(null);
      if (mode === "append") setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          perPage: String(perPage),
          type: filter,
        });
        const searchTerm = search.trim();
        if (searchTerm) params.set("search", searchTerm);

        const response = await fetch(`/api/wordpress-media?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as MediaLibraryResponse;

        if (!response.ok) {
          throw new Error(payload.message ?? "WordPress media could not load.");
        }

        const incoming = payload.media ?? [];
        const nextHasMore =
          Boolean(payload.hasNextPage) ||
          (payload.totalPages ?? 1) > (payload.page ?? nextPage);
        setItems((current) =>
          mode === "append" ? mergeMedia(current, incoming) : incoming,
        );
        setPage(payload.page ?? nextPage);
        setTotalItems(payload.total ?? incoming.length);
        setTotalPages(payload.totalPages ?? 1);
        setHasNextPage(nextHasMore);
        setStatus(
          incoming.length
            ? nextHasMore
              ? `${mode === "append" ? "Loaded" : "Showing"} ${
                  mode === "append"
                    ? Math.max(nextPage * perPage, incoming.length)
                    : incoming.length
                } media · more available`
              : `${mode === "append" ? "Loaded" : "Showing"} ${
                  mode === "append"
                    ? Math.min(nextPage * perPage, payload.total ?? incoming.length)
                    : incoming.length
                } of ${payload.total ?? incoming.length}`
            : "No media matched this view",
        );
      } catch (caught) {
        if ((caught as Error).name === "AbortError") return;
        const message =
          caught instanceof Error
            ? caught.message
            : "WordPress media could not load.";
        setError(message);
        setStatus(message);
        if (mode === "replace") setItems([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [filter, perPage, search],
  );

  const refresh = useCallback(() => {
    setPage(1);
    return fetchPage(1, "replace");
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasNextPage) return;
    void fetchPage(page + 1, "append");
  }, [fetchPage, hasNextPage, loading, loadingMore, page]);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadProgress(15);
      setError(null);
      setStatus(`Uploading ${file.name}...`);

      try {
        const formData = new FormData();
        formData.append("file", file);
        setUploadProgress(45);
        const response = await fetch("/api/wordpress-media", {
          method: "POST",
          body: formData,
        });
        setUploadProgress(80);
        const payload = (await response.json()) as {
          media?: WordPressMediaItem;
          message?: string;
        };

        if (!response.ok || !payload.media) {
          throw new Error(payload.message ?? "WordPress upload failed.");
        }

        setItems((current) => mergeMedia([payload.media!], current));
        setSelectedItem(payload.media);
        setStatus("Uploaded to WordPress media library");
        setUploadProgress(100);
        return payload.media;
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "WordPress upload failed.";
        setError(message);
        setStatus(message);
        return null;
      } finally {
        window.setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 450);
      }
    },
    [],
  );

  const updateMedia = useCallback(
    async (id: number, patch: Partial<WordPressMediaItem>) => {
      setError(null);
      const response = await fetch("/api/wordpress-media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: patch.title,
          altText: patch.altText,
          caption: patch.caption,
          description: patch.description,
        }),
      });
      const payload = (await response.json()) as {
        media?: WordPressMediaItem;
        message?: string;
      };

      if (!response.ok || !payload.media) {
        const message = payload.message ?? "WordPress media update failed.";
        setError(message);
        setStatus(message);
        return null;
      }

      setItems((current) =>
        current.map((item) => (item.id === id ? payload.media! : item)),
      );
      setSelectedItem(payload.media);
      setStatus("Media details updated");
      return payload.media;
    },
    [],
  );

  const deleteMedia = useCallback(async (id: number) => {
    setError(null);
    const response = await fetch(`/api/wordpress-media?id=${id}`, {
      method: "DELETE",
    });
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (!response.ok) {
      const message = payload?.message ?? "WordPress media delete failed.";
      setError(message);
      setStatus(message);
      return false;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedItem((current) => (current?.id === id ? null : current));
    setStatus("Media deleted from WordPress");
    return true;
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, search.trim() ? 260 : 120);
    return () => window.clearTimeout(timer);
  }, [open, refresh, search]);

  return {
    items,
    visibleItems: clientFilteredItems,
    selectedItem,
    setSelectedItem,
    search,
    setSearch,
    filter,
    setFilter,
    page,
    totalItems,
    totalPages,
    hasNextPage,
    loading,
    loadingMore,
    uploading,
    uploadProgress,
    error,
    status,
    refresh,
    loadMore,
    uploadFile,
    updateMedia,
    deleteMedia,
  };
}
