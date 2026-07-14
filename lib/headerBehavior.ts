export type HeaderBehavior =
  | "static"
  | "sticky"
  | "sticky-on-scroll-up"
  | "pill-on-scroll";

type HeaderBehaviorSource = {
  headerBehavior?: unknown;
  headerLayout?: unknown;
  headerSticky?: unknown;
};

export function resolveHeaderBehavior(source: HeaderBehaviorSource): HeaderBehavior {
  if (
    source.headerBehavior === "static" ||
    source.headerBehavior === "sticky" ||
    source.headerBehavior === "sticky-on-scroll-up" ||
    source.headerBehavior === "pill-on-scroll"
  ) {
    return source.headerBehavior;
  }

  // Compatibility migration for documents saved before Header Behavior existed.
  if (source.headerLayout === "pill" || source.headerLayout === "princity") {
    return "pill-on-scroll";
  }
  return source.headerSticky === false ? "static" : "sticky";
}
