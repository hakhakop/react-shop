const BUILDER_LINE_BREAK_PATTERN = /(?:\r\n?|\n|<br\s*\/?>|<\/br\s*>)/gi;

export function normalizeBuilderLineBreaks(value: string): string {
  return value.replace(BUILDER_LINE_BREAK_PATTERN, "\n");
}
