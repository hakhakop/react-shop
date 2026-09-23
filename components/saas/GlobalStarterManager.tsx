"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp, Film, FolderOpen, ImageIcon, Trash2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MediaManager from "@/components/dashboard/media/MediaManager";
import type { WordPressMediaItem } from "@/components/dashboard/builderTypes";

type GlobalStarterRecord = {
  id: string;
  sourceWebsiteId: string;
  title: string;
  description: string;
  category: string;
  previewImageUrl?: string;
  hoverImageUrl?: string;
  hoverVideoUrl?: string;
  sortOrder: number;
  enabled: boolean;
};

type MediaField = "previewImageUrl" | "hoverImageUrl" | "hoverVideoUrl";
type MediaKind = "image" | "video";
const GLOBAL_STARTER_DISCLOSURE_EVENT = "webpages:global-starter-disclosure";

function CatalogMediaField({
  label,
  value,
  kind,
  onChoose,
  onRemove,
}: {
  label: string;
  value: string;
  kind: MediaKind;
  onChoose: () => void;
  onRemove: () => void;
}) {
  const hasMedia = Boolean(value.trim());
  const isVideo = kind === "video";
  const MediaIcon = isVideo ? Video : ImageIcon;

  return (
    <article className="saas-admin-global-starter-media-card">
      <div className="saas-admin-global-starter-media-heading">
        <span>{label}</span>
        <MediaIcon size={15} aria-hidden="true" />
      </div>
      <button
        type="button"
        className={`saas-admin-global-starter-media-preview ${hasMedia ? "has-media" : "is-empty"}`}
        onClick={onChoose}
        aria-label={hasMedia ? `Replace ${label}` : `Choose ${label} from Media Library`}
      >
        {hasMedia ? (
          isVideo ? (
            <video
              src={value}
              muted
              controls
              preload="metadata"
              aria-label={`${label} preview`}
            />
          ) : (
            <Image
              src={value}
              alt={`${label} preview`}
              width={640}
              height={360}
              unoptimized
            />
          )
        ) : (
          <span className="saas-admin-global-starter-media-empty-state">
            {isVideo ? <Film size={25} /> : <ImageIcon size={25} />}
            <strong>No {label.toLowerCase()} selected</strong>
          </span>
        )}
      </button>
      <div className="saas-admin-global-starter-media-actions">
        <button type="button" onClick={onChoose}>
          <FolderOpen size={14} />
          {hasMedia ? "Replace" : "Choose from Media Library"}
        </button>
        {hasMedia ? (
          <button
            type="button"
            className="is-remove"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
          >
            <Trash2 size={14} /> Remove
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default function GlobalStarterManager({
  websiteId,
  websiteName,
  starter,
  initialExpanded = false,
}: {
  websiteId: string;
  websiteName: string;
  starter: GlobalStarterRecord | null;
  initialExpanded?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(starter?.title ?? websiteName);
  const [description, setDescription] = useState(starter?.description ?? "");
  const [category, setCategory] = useState(starter?.category ?? "WebPages");
  const [previewImageUrl, setPreviewImageUrl] = useState(starter?.previewImageUrl ?? "");
  const [hoverImageUrl, setHoverImageUrl] = useState(starter?.hoverImageUrl ?? "");
  const [hoverVideoUrl, setHoverVideoUrl] = useState(starter?.hoverVideoUrl ?? "");
  const [sortOrder, setSortOrder] = useState(String(starter?.sortOrder ?? 0));
  const [enabled, setEnabled] = useState(starter?.enabled ?? true);
  const [mediaPickerField, setMediaPickerField] = useState<MediaField | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(Boolean(starter && initialExpanded));
  const isExpanded = Boolean(starter) && expanded;

  useEffect(() => {
    if (!starter) return;

    const handleDisclosure = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (detail?.id && detail.id !== starter.id) setExpanded(false);
    };

    window.addEventListener(GLOBAL_STARTER_DISCLOSURE_EVENT, handleDisclosure);
    return () => window.removeEventListener(GLOBAL_STARTER_DISCLOSURE_EVENT, handleDisclosure);
  }, [starter]);

  const mediaValues: Record<MediaField, string> = {
    previewImageUrl,
    hoverImageUrl,
    hoverVideoUrl,
  };

  const mediaLabels: Record<MediaField, string> = {
    previewImageUrl: "Preview Image",
    hoverImageUrl: "Hover Image",
    hoverVideoUrl: "Hover Video",
  };

  function setMediaValue(field: MediaField, value: string) {
    if (field === "previewImageUrl") setPreviewImageUrl(value);
    if (field === "hoverImageUrl") setHoverImageUrl(value);
    if (field === "hoverVideoUrl") setHoverVideoUrl(value);
  }

  function openMediaPicker(field: MediaField) {
    setMediaPickerField(field);
  }

  function toggleExpanded() {
    if (!starter) return;
    const nextExpanded = !isExpanded;
    if (nextExpanded) {
      window.dispatchEvent(new CustomEvent(GLOBAL_STARTER_DISCLOSURE_EVENT, {
        detail: { id: starter.id },
      }));
    }
    setExpanded(nextExpanded);
  }

  function handleMediaSelect(media: WordPressMediaItem) {
    if (!mediaPickerField) return;
    setMediaValue(mediaPickerField, media.sourceUrl);
    setMediaPickerField(null);
  }

  async function request(url: string, init?: RequestInit) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(url, {
        ...init,
        headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Global Starter update failed.");
      router.refresh();
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Global Starter update failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!starter) {
    return (
      <div className="saas-admin-global-starter saas-admin-global-starter--empty">
        <div className="saas-admin-global-starter-section-heading">
          <span className="saas-admin-global-starter-label">Global Starter</span>
          <h3>Publish this website as a reusable starter</h3>
          <p>Designate the current website to add it to the public starter catalog.</p>
        </div>
        <div className="saas-admin-global-starter-actions">
          <button
            type="button"
            disabled={busy}
            onClick={() => request("/api/admin/global-starters", {
              method: "POST",
              body: JSON.stringify({ sourceWebsiteId: websiteId, title: websiteName }),
            })}
          >
            {busy ? "Designating…" : "Designate as Global Starter"}
          </button>
        </div>
        {message && <small role="status">{message}</small>}
      </div>
    );
  }

  const editorId = `global-starter-editor-${starter.id}`;

  return (
    <div className="saas-admin-global-starter">
      <div className="saas-admin-global-starter-summary">
        <div className="saas-admin-global-starter-summary-main">
          <div>
            <span className="saas-admin-global-starter-label">Global Starter</span>
            <h3>{starter.title || websiteName}</h3>
          </div>
          <div className="saas-admin-global-starter-summary-facts">
            <span>{starter.category || "Uncategorized"}</span>
            <span className={`saas-admin-global-starter-summary-status ${starter.enabled ? "is-enabled" : "is-disabled"}`}>
              {starter.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="saas-admin-global-starter-summary-toggle"
          aria-expanded={isExpanded}
          aria-controls={editorId}
          onClick={toggleExpanded}
        >
          {isExpanded ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
          {isExpanded ? "Collapse editor" : "Edit"}
        </button>
      </div>
      <div id={editorId} className="saas-admin-global-starter-editor" hidden={!isExpanded}>
        <div className="saas-admin-global-starter-heading">
          <div>
            <span className="saas-admin-global-starter-label">Global Starter</span>
            <h3>Catalog presentation</h3>
          </div>
          <p>Manage how this website appears in the public starter catalog.</p>
        </div>
        <form onSubmit={(event) => {
          event.preventDefault();
          void request("/api/admin/global-starters", {
            method: "PUT",
            body: JSON.stringify({
              id: starter.id,
              title,
              description,
              category,
              previewImageUrl,
              hoverImageUrl,
              hoverVideoUrl,
              sortOrder: Number(sortOrder),
              enabled,
            }),
          });
        }}>
          <section className="saas-admin-global-starter-section">
            <div className="saas-admin-global-starter-section-heading">
              <span>Public information</span>
              <h4>What visitors see first</h4>
            </div>
            <div className="saas-admin-global-starter-fields saas-admin-global-starter-fields--public">
              <label className="saas-auth-field">
                <span>Public title</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} />
              </label>
              <label className="saas-auth-field">
                <span>Category</span>
                <input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={80} />
              </label>
              <label className="saas-auth-field saas-admin-global-starter-description">
                <span>Description</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={240} rows={4} />
              </label>
            </div>
          </section>

          <section className="saas-admin-global-starter-section">
            <div className="saas-admin-global-starter-section-heading">
              <span>Catalog media</span>
              <h4>Choose media from the Root WordPress library</h4>
            </div>
            <div className="saas-admin-global-starter-media-grid">
              <CatalogMediaField
                label={mediaLabels.previewImageUrl}
                value={previewImageUrl}
                kind="image"
                onChoose={() => openMediaPicker("previewImageUrl")}
                onRemove={() => setMediaValue("previewImageUrl", "")}
              />
              <CatalogMediaField
                label={mediaLabels.hoverImageUrl}
                value={hoverImageUrl}
                kind="image"
                onChoose={() => openMediaPicker("hoverImageUrl")}
                onRemove={() => setMediaValue("hoverImageUrl", "")}
              />
              <CatalogMediaField
                label={mediaLabels.hoverVideoUrl}
                value={hoverVideoUrl}
                kind="video"
                onChoose={() => openMediaPicker("hoverVideoUrl")}
                onRemove={() => setMediaValue("hoverVideoUrl", "")}
              />
            </div>
          </section>

          <section className="saas-admin-global-starter-section">
            <div className="saas-admin-global-starter-section-heading">
              <span>Publishing</span>
              <h4>Control catalog visibility</h4>
            </div>
            <div className="saas-admin-global-starter-publishing">
              <label className="saas-auth-field saas-admin-global-starter-order">
                <span>Order</span>
                <input type="number" min={0} max={9999} value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
              </label>
              <label className="saas-admin-global-starter-toggle">
                <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
                <span>Publicly enabled</span>
              </label>
            </div>
            <div className="saas-admin-global-starter-actions">
              <button className="saas-admin-global-starter-save" type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                className="saas-admin-global-starter-remove"
                type="button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm("Remove this Global Starter designation? The source website will remain unchanged.")) {
                    void request(`/api/admin/global-starters?id=${encodeURIComponent(starter.id)}`, { method: "DELETE" });
                  }
                }}
              >
                Remove designation
              </button>
            </div>
          </section>
        </form>
        {message && <small role="status">{message}</small>}

        <MediaManager
          open={mediaPickerField !== null}
          title={mediaPickerField ? `Select ${mediaLabels[mediaPickerField]}` : "Root WordPress Media"}
          currentUrl={mediaPickerField ? mediaValues[mediaPickerField] : undefined}
          onSelect={handleMediaSelect}
          onClose={() => setMediaPickerField(null)}
        />
      </div>
    </div>
  );
}
