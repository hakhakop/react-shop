import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import en from "@/data/i18n/en.json";
import { getRuntimeDataDir, getSeedDataDir } from "@/lib/runtimeDataDir";
import {
  supportedLocales,
  validateMessages,
  type Locale,
  type Messages,
} from "@/lib/i18n";

export function getI18nDir() {
  return path.join(getRuntimeDataDir(), "i18n");
}

function getSeedI18nDir() {
  return path.join(getSeedDataDir(), "i18n");
}

export function getI18nFilePath(locale: Locale) {
  return path.join(getI18nDir(), `${locale}.json`);
}

async function readMessagesFile(filePath: string): Promise<Messages | null> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8"));
    const validated = validateMessages(parsed);
    return validated.ok ? validated.messages : null;
  } catch {
    return null;
  }
}

export async function loadMessages(locale: Locale): Promise<Messages> {
  const runtime = await readMessagesFile(getI18nFilePath(locale));
  if (runtime) return runtime;

  const seed = await readMessagesFile(path.join(getSeedI18nDir(), `${locale}.json`));
  if (seed) return seed;

  return en;
}

export async function loadAllMessages(): Promise<Record<Locale, Messages>> {
  const entries = await Promise.all(
    supportedLocales.map(async (locale) => [locale, await loadMessages(locale)] as const),
  );
  return Object.fromEntries(entries) as Record<Locale, Messages>;
}

export async function saveMessages(locale: Locale, messages: Messages) {
  const validated = validateMessages(messages);
  if (!validated.ok) return validated;

  await mkdir(getI18nDir(), { recursive: true });
  await writeFile(
    getI18nFilePath(locale),
    `${JSON.stringify(validated.messages, null, 2)}\n`,
    "utf8",
  );
  return { ok: true as const, messages: validated.messages };
}
