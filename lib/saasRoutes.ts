export function loginRedirectFor(path: string) {
  const next = path.startsWith("/") ? path : "/app";
  return `/login?next=${encodeURIComponent(next)}`;
}

export function getSafeNextPath(value: unknown) {
  if (typeof value !== "string") return "/app";
  if (!value.startsWith("/") || value.startsWith("//")) return "/app";
  if (value.startsWith("/login") || value.startsWith("/register")) return "/app";
  return value;
}
