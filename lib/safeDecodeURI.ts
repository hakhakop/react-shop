export function safeDecodeURI(value: string): string {
  if (/%[0-9a-fA-F]{2}/.test(value)) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return value;
}
