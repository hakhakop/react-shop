export type HeaderElementAlignment = "left" | "center" | "right";

type HeaderElementLike = {
  kind?: string;
  id?: string;
  elementAlign?: string;
  imageAlignment?: string;
};

function asAlignment(
  value: string | undefined,
): HeaderElementAlignment | undefined {
  return value === "left" || value === "center" || value === "right"
    ? value
    : undefined;
}

export function resolveHeaderColumnAlignment(
  columnIndex = 0,
  columnCount = 1,
): HeaderElementAlignment {
  if (columnCount <= 1 || columnIndex <= 0) return "left";
  if (columnIndex >= columnCount - 1) return "right";
  return "center";
}

export function resolveHeaderElementAlignment(
  element: HeaderElementLike,
  columnIndex = 0,
  columnCount = 1,
): HeaderElementAlignment {
  const fallback = resolveHeaderColumnAlignment(columnIndex, columnCount);
  return element.kind === "image" || element.id === "header-logo"
    ? asAlignment(element.imageAlignment) ?? fallback
    : asAlignment(element.elementAlign) ?? fallback;
}
