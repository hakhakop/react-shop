export function isBuilderIframePreview(
  search = typeof window === "undefined" ? "" : window.location.search,
) {
  return new URLSearchParams(search).get("builderFrame") === "selection";
}
