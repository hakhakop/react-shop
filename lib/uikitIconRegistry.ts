/**
 * WebPages UIkit Icon System v1
 *
 * The registry owns document-safe identifiers and searchable labels only.
 * SVG markup remains owned by the installed UIkit icon plugin and is rendered
 * through the shared WebPagesIcon component.
 */

export const UIKIT_ICON_NAMES = [
  "500px",
  "album",
  "android",
  "android-robot",
  "apple",
  "arrow-down",
  "arrow-down-arrow-up",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "arrow-up-right",
  "bag",
  "ban",
  "behance",
  "bell",
  "bluesky",
  "bold",
  "bolt",
  "bookmark",
  "calendar",
  "camera",
  "cart",
  "check",
  "chevron-double-left",
  "chevron-double-right",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "clock",
  "close",
  "close-circle",
  "cloud-download",
  "cloud-upload",
  "code",
  "cog",
  "comment",
  "commenting",
  "comments",
  "copy",
  "credit-card",
  "crosshairs",
  "database",
  "desktop",
  "discord",
  "download",
  "dribbble",
  "etsy",
  "expand",
  "eye",
  "eye-slash",
  "facebook",
  "file",
  "file-edit",
  "file-pdf",
  "file-text",
  "flickr",
  "folder",
  "forward",
  "foursquare",
  "future",
  "git-branch",
  "git-fork",
  "github",
  "github-alt",
  "gitter",
  "google",
  "grid",
  "happy",
  "hashtag",
  "heart",
  "history",
  "home",
  "image",
  "info",
  "instagram",
  "italic",
  "joomla",
  "laptop",
  "lifesaver",
  "link",
  "link-external",
  "linkedin",
  "list",
  "location",
  "lock",
  "mail",
  "mastodon",
  "menu",
  "microphone",
  "microsoft",
  "minus",
  "minus-circle",
  "more",
  "more-vertical",
  "move",
  "nut",
  "paint-bucket",
  "pencil",
  "phone",
  "phone-landscape",
  "pinterest",
  "play",
  "play-circle",
  "plus",
  "plus-circle",
  "print",
  "pull",
  "push",
  "question",
  "quote-right",
  "receiver",
  "reddit",
  "refresh",
  "reply",
  "rss",
  "search",
  "server",
  "settings",
  "shrink",
  "sign-in",
  "sign-out",
  "signal",
  "social",
  "sorting",
  "soundcloud",
  "star",
  "strikethrough",
  "table",
  "tablet",
  "tablet-landscape",
  "tag",
  "telegram",
  "threads",
  "thumbnails",
  "tiktok",
  "trash",
  "triangle-down",
  "triangle-left",
  "triangle-right",
  "triangle-up",
  "tripadvisor",
  "tumblr",
  "tv",
  "twitch",
  "twitter",
  "uikit",
  "unlock",
  "upload",
  "user",
  "users",
  "video-camera",
  "vimeo",
  "warning",
  "whatsapp",
  "wordpress",
  "world",
  "x",
  "xing",
  "yelp",
  "yootheme",
  "youtube",
] as const;

export type UikitIconName = (typeof UIKIT_ICON_NAMES)[number];

export type UikitIconOption = {
  name: UikitIconName;
  label: string;
  keywords: string;
};

const legacyAliases: Record<string, UikitIconName> = {
  arrowRight: "arrow-right",
  circleCheck: "check",
  sparkles: "star",
  shield: "lock",
  truck: "cart",
};

function iconLabel(name: string) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const UIKIT_ICON_OPTIONS: readonly UikitIconOption[] = UIKIT_ICON_NAMES.map(
  (name) => ({
    name,
    label: iconLabel(name),
    keywords: `${name} ${name.replace(/-/g, " ")}`,
  }),
);

const iconNameSet = new Set<string>(UIKIT_ICON_NAMES);

/** Resolve current UIkit ids while keeping old documents renderable. */
export function resolveUikitIconName(
  value: string | null | undefined,
): UikitIconName | null {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) return null;
  if (iconNameSet.has(normalized)) return normalized as UikitIconName;
  return legacyAliases[normalized] ?? null;
}

export function getUikitIconLabel(value: string | null | undefined) {
  const resolved = resolveUikitIconName(value);
  if (!resolved) return "None";
  return UIKIT_ICON_OPTIONS.find((option) => option.name === resolved)?.label ?? resolved;
}
