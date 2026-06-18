"use client";

import Image from "next/image";
import {
  Clipboard,
  Copy,
  FileText,
  ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Video,
  Maximize2,
  Minimize2,
  PanelTop,
  Grid2X2,
  Grid3X3,
  Rows3,
  X,
} from "lucide-react";
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { WordPressMediaItem } from "@/components/dashboard/builderTypes";
import {
  type MediaLibraryFilter,
  useMediaLibrary,
} from "@/components/dashboard/media/useMediaLibrary";

type MediaManagerProps = {
  open: boolean;
  title: string;
  currentUrl?: string;
  multiple?: boolean;
  onSelect: (media: WordPressMediaItem) => void;
  onSelectMany?: (media: WordPressMediaItem[]) => void;
  onClose: () => void;
};

const filters: {
  value: MediaLibraryFilter;
  label: string;
  icon: typeof ImageIcon;
}[] = [
  { value: "all", label: "All Media", icon: ImageIcon },
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "videos", label: "Videos", icon: Video },
];

type MediaManagerSize = "compact" | "comfortable" | "fullscreen";
type MediaGridDensity = "large" | "medium" | "compact";
const sizeLabels: Record<MediaManagerSize, string> = {
  compact: "Compact",
  comfortable: "Comfortable",
  fullscreen: "Fullscreen",
};
const gridDensityLabels: Record<MediaGridDensity, string> = {
  compact: "Compact scan",
  medium: "Browse grid",
  large: "Large preview",
};

function formatBytes(value?: number) {
  if (!value) return "Unknown";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value?: string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isImage(item: WordPressMediaItem) {
  return item.mimeType?.startsWith("image/");
}

export default function MediaManager({
  open,
  title,
  currentUrl,
  multiple = false,
  onSelect,
  onSelectMany,
  onClose,
}: MediaManagerProps) {
  const {
    visibleItems,
    selectedItem,
    setSelectedItem,
    search,
    setSearch,
    filter,
    setFilter,
    totalItems,
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
  } = useMediaLibrary({ open });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [sizeMode, setSizeMode] = useState<MediaManagerSize>("comfortable");
  const [gridDensity, setGridDensity] = useState<MediaGridDensity>("medium");
  const gridRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const selectedItems = useMemo(
    () => visibleItems.filter((item) => selectedIds.has(item.id)),
    [selectedIds, visibleItems],
  );

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      return;
    }
    const match = currentUrl
      ? visibleItems.find((item) => item.sourceUrl === currentUrl)
      : null;
    if (match) {
      setSelectedItem(match);
      setSelectedIds(new Set([match.id]));
    }
  }, [currentUrl, open, setSelectedItem, visibleItems]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const saved = window.localStorage.getItem("builder-media-manager-size");
    if (
      saved === "compact" ||
      saved === "comfortable" ||
      saved === "fullscreen"
    ) {
      setSizeMode(saved);
    }
    const savedGrid = window.localStorage.getItem("builder-media-grid-density");
    if (
      savedGrid === "compact" ||
      savedGrid === "medium" ||
      savedGrid === "large"
    ) {
      setGridDensity(savedGrid);
    }
  }, [open]);

  const updateSizeMode = (next: MediaManagerSize) => {
    setSizeMode(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("builder-media-manager-size", next);
    }
  };

  const updateGridDensity = (next: MediaGridDensity) => {
    setGridDensity(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("builder-media-grid-density", next);
    }
  };

  useEffect(() => {
    if (!open) return;

    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        if (!item.type.startsWith("image/")) continue;
        const blob = item.getAsFile();
        if (!blob) continue;
        const extension = blob.type.split("/")[1] || "png";
        const file = new File([blob], `pasted-image.${extension}`, {
          type: blob.type,
        });
        event.preventDefault();
        void uploadFile(file).then((media) => {
          if (media) setSelectedIds(new Set([media.id]));
        });
        return;
      }
    };

    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [open, uploadFile]);

  const handleFiles = async (files: FileList | File[]) => {
    const file = files[0];
    if (!file) return;
    const media = await uploadFile(file);
    if (media) setSelectedIds(new Set([media.id]));
  };

  const handlePick = (item: WordPressMediaItem, additive: boolean) => {
    setSelectedItem(item);
    setSelectedIds((current) => {
      if (!multiple || !additive) return new Set([item.id]);
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selectedItem || visibleItems.length === 0) return;
    const currentIndex = visibleItems.findIndex(
      (item) => item.id === selectedItem.id,
    );
    if (currentIndex < 0) return;
    const columns = 5;
    const nextIndex =
      event.key === "ArrowRight"
        ? currentIndex + 1
        : event.key === "ArrowLeft"
          ? currentIndex - 1
          : event.key === "ArrowDown"
            ? currentIndex + columns
            : event.key === "ArrowUp"
              ? currentIndex - columns
              : currentIndex;
    if (nextIndex === currentIndex) return;
    const nextItem = visibleItems[Math.max(0, Math.min(visibleItems.length - 1, nextIndex))];
    if (nextItem) {
      event.preventDefault();
      handlePick(nextItem, event.shiftKey || event.metaKey || event.ctrlKey);
    }
  };

  const handleSelect = () => {
    if (multiple && selectedItems.length > 0) {
      onSelectMany?.(selectedItems);
      onSelect(selectedItems[0]);
      onClose();
      return;
    }
    if (selectedItem) {
      onSelect(selectedItem);
      onClose();
    }
  };

  const saveDetails = async () => {
    if (!selectedItem) return;
    await updateMedia(selectedItem.id, selectedItem);
  };

  if (!open) return null;

  return (
    <div className="builder-media-manager" role="dialog" aria-modal="true">
      <div
        className={`builder-media-manager-dialog builder-panel is-${sizeMode}`}
      >
        <header className="builder-media-manager-toolbar">
          <div className="builder-media-manager-title">
            <strong>{title}</strong>
            <span>{status}</span>
          </div>
          <div className="builder-media-manager-actions">
            <button
              type="button"
              className="builder-secondary-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={15} /> Upload
            </button>
            <button
              type="button"
              className="builder-secondary-button"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <div
              className="builder-media-window-controls"
              aria-label="Media manager size"
            >
              <button
                type="button"
                className={`is-compact ${sizeMode === "compact" ? "is-active" : ""}`}
                onClick={() => updateSizeMode("compact")}
                title="Compact"
                aria-label="Compact media manager"
              >
                <Minimize2 size={11} />
              </button>
              <button
                type="button"
                className={`is-comfortable ${sizeMode === "comfortable" ? "is-active" : ""}`}
                onClick={() => updateSizeMode("comfortable")}
                title="Comfortable"
                aria-label="Comfortable media manager"
              >
                <PanelTop size={11} />
              </button>
              <button
                type="button"
                className={`is-fullscreen ${sizeMode === "fullscreen" ? "is-active" : ""}`}
                onClick={() => updateSizeMode("fullscreen")}
                title="Fullscreen"
                aria-label="Fullscreen media manager"
              >
                <Maximize2 size={11} />
              </button>
            </div>
            <button type="button" onClick={onClose} aria-label="Close media manager">
              <X size={16} />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={(event) => void handleFiles(event.target.files ?? [])}
          />
          <input
            ref={replaceInputRef}
            type="file"
            hidden
            onChange={(event) => void handleFiles(event.target.files ?? [])}
          />
        </header>

        <div className="builder-media-manager-search">
          <label>
            <Search size={15} />
            <input
              value={search}
              placeholder="Search by filename, title, alt text..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="builder-media-manager-filters" role="tablist">
            {filters.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={filter === option.value ? "is-active" : ""}
                  onClick={() => setFilter(option.value)}
                >
                  <Icon size={14} />
                  {option.label}
                </button>
              );
            })}
          </div>
          <div
            className="builder-media-grid-controls"
            aria-label="Media grid density"
          >
            <button
              type="button"
              className={gridDensity === "large" ? "is-active" : ""}
              onClick={() => updateGridDensity("large")}
              title={gridDensityLabels.large}
              aria-label={gridDensityLabels.large}
            >
              <Grid2X2 size={14} />
            </button>
            <button
              type="button"
              className={gridDensity === "medium" ? "is-active" : ""}
              onClick={() => updateGridDensity("medium")}
              title={gridDensityLabels.medium}
              aria-label={gridDensityLabels.medium}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              type="button"
              className={gridDensity === "compact" ? "is-active" : ""}
              onClick={() => updateGridDensity("compact")}
              title={gridDensityLabels.compact}
              aria-label={gridDensityLabels.compact}
            >
              <Rows3 size={14} />
            </button>
          </div>
        </div>

        <div className="builder-media-upload-progress" aria-hidden={!uploading}>
          <span style={{ width: uploading ? `${uploadProgress}%` : "0%" }} />
        </div>

        <main className="builder-media-manager-body">
          <section
            className={`builder-media-manager-canvas ${dragging ? "is-dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void handleFiles(event.dataTransfer.files);
            }}
          >
            <div className="builder-media-drop-hint">
              <Clipboard size={16} />
              Drop files here, upload with the button, or paste an image.
            </div>
            <div
              ref={gridRef}
              className={`builder-media-manager-grid is-${gridDensity}`}
              tabIndex={0}
              onKeyDown={handleGridKeyDown}
              onScroll={(event) => {
                const target = event.currentTarget;
                const distance =
                  target.scrollHeight - target.scrollTop - target.clientHeight;
                if (distance < 260) loadMore();
              }}
            >
              {loading && visibleItems.length === 0
                ? Array.from({ length: 16 }).map((_, index) => (
                    <div
                      key={index}
                      className="builder-media-skeleton"
                      aria-hidden="true"
                    />
                  ))
                : visibleItems.map((item) => {
                    const selected = selectedIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={selected ? "is-selected" : ""}
                        onClick={(event) =>
                          handlePick(
                            item,
                            event.shiftKey || event.metaKey || event.ctrlKey,
                          )
                        }
                        onDoubleClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                      >
                        <span className="builder-media-manager-thumb">
                          {isImage(item) && item.thumbnailUrl ? (
                            <Image
                              src={item.thumbnailUrl}
                              alt={item.altText || item.title}
                              width={260}
                              height={200}
                              unoptimized
                              loading="lazy"
                            />
                          ) : item.mimeType?.startsWith("video/") ? (
                            <Video size={24} />
                          ) : (
                            <FileText size={24} />
                          )}
                        </span>
                        <span>{item.title || item.filename}</span>
                      </button>
                    );
                  })}
              {loadingMore ? (
                <div className="builder-media-loading-more">
                  <Loader2 size={16} /> Loading more...
                </div>
              ) : null}
            </div>
            <div className="builder-media-load-more-row">
              {hasNextPage ? (
                <button
                  type="button"
                  className="builder-secondary-button"
                  onClick={loadMore}
                  disabled={loading || loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={15} /> Loading more...
                    </>
                  ) : (
                    "Load more media"
                  )}
                </button>
              ) : visibleItems.length > 0 ? (
                <span>End of loaded media for this view.</span>
              ) : null}
            </div>
            {!loading && visibleItems.length === 0 ? (
              <div className="builder-media-empty">
                <ImageIcon size={24} />
                <strong>No media found</strong>
                <span>Try another search, filter, or upload a file.</span>
              </div>
            ) : null}
            {error ? (
              <div className="builder-media-error">
                <span>{error}</span>
                <button type="button" onClick={refresh}>
                  Retry
                </button>
              </div>
            ) : null}
          </section>

          <aside className="builder-media-manager-details">
            {selectedItem ? (
              <>
                <div className="builder-media-detail-preview">
                  {isImage(selectedItem) ? (
                    <Image
                      src={selectedItem.sourceUrl}
                      alt={selectedItem.altText || selectedItem.title}
                      width={420}
                      height={320}
                      unoptimized
                    />
                  ) : (
                    <FileText size={36} />
                  )}
                </div>
                <div className="builder-media-detail-meta">
                  <strong>{selectedItem.filename || selectedItem.title}</strong>
                  <span>{selectedItem.mimeType || "Unknown type"}</span>
                  <span>Uploaded {formatDate(selectedItem.date)}</span>
                  <span>
                    {selectedItem.width && selectedItem.height
                      ? `${selectedItem.width} x ${selectedItem.height}px`
                      : "Dimensions unknown"}
                  </span>
                  <span>{formatBytes(selectedItem.fileSize)}</span>
                </div>
                <label className="builder-field">
                  <span>Alt Text</span>
                  <input
                    value={selectedItem.altText ?? ""}
                    onChange={(event) =>
                      setSelectedItem({
                        ...selectedItem,
                        altText: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="builder-field">
                  <span>Caption</span>
                  <textarea
                    value={selectedItem.caption ?? ""}
                    onChange={(event) =>
                      setSelectedItem({
                        ...selectedItem,
                        caption: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="builder-field">
                  <span>Description</span>
                  <textarea
                    value={selectedItem.description ?? ""}
                    onChange={(event) =>
                      setSelectedItem({
                        ...selectedItem,
                        description: event.target.value,
                      })
                    }
                  />
                </label>
                <div className="builder-media-detail-actions">
                  <button
                    type="button"
                    className="builder-secondary-button"
                    onClick={() => void navigator.clipboard.writeText(selectedItem.sourceUrl)}
                  >
                    <Copy size={14} /> Copy URL
                  </button>
                  <button
                    type="button"
                    className="builder-secondary-button"
                    onClick={() => replaceInputRef.current?.click()}
                  >
                    <Upload size={14} /> Replace file
                  </button>
                  <button
                    type="button"
                    className="builder-secondary-button"
                    onClick={saveDetails}
                  >
                    Save details
                  </button>
                  <button
                    type="button"
                    className="builder-danger-button"
                    onClick={() => void deleteMedia(selectedItem.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            ) : (
              <div className="builder-media-empty">
                <ImageIcon size={22} />
                <strong>Select a media item</strong>
                <span>Details and actions appear here.</span>
              </div>
            )}
          </aside>
        </main>

        <footer className="builder-media-manager-footer">
          <span>
            {selectedIds.size
              ? `${selectedIds.size} selected`
              : hasNextPage
                ? `${visibleItems.length} loaded · more available`
                : `${visibleItems.length} loaded of ${totalItems}`}
          </span>
          <div>
            <button
              type="button"
              className="builder-secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="builder-primary-button"
              onClick={handleSelect}
              disabled={!selectedItem}
            >
              Select
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
