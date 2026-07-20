"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, RotateCcw, Search, Upload } from "lucide-react";
import {
  localeLabels,
  supportedLocales,
  translate,
  type Locale,
  type Messages,
  type TranslationKey,
} from "@/lib/i18n";

type Section = {
  id: string;
  titleKey: TranslationKey;
  prefixes: string[];
};

const sections: Section[] = [
  { id: "common", titleKey: "translations.section.common", prefixes: ["common.", "theme."] },
  { id: "auth", titleKey: "translations.section.authentication", prefixes: ["auth."] },
  { id: "dashboard", titleKey: "translations.section.dashboard", prefixes: ["dashboard."] },
  { id: "navigation", titleKey: "translations.section.navigation", prefixes: ["navigation.", "language."] },
  { id: "websites", titleKey: "translations.section.websiteCreation", prefixes: ["websites.", "wizard."] },
  { id: "validation", titleKey: "translations.section.validation", prefixes: ["validation.", "errors."] },
  { id: "translations", titleKey: "translations.section.translations", prefixes: ["translations."] },
];

function getSection(key: string) {
  return sections.find((section) => section.prefixes.some((prefix) => key.startsWith(prefix))) ?? sections[0];
}

function sortKeys(messages: Messages) {
  return Object.keys(messages).sort((left, right) => left.localeCompare(right));
}

function validateImport(value: unknown): value is Messages {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([key, entry]) =>
        /^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)+$/.test(key) && typeof entry === "string",
    )
  );
}

export default function TranslationsManager({
  initialMessages,
}: {
  initialMessages: Record<Locale, Messages>;
}) {
  const [activeLocale, setActiveLocale] = useState<Locale>("en");
  const [savedMessages, setSavedMessages] = useState(initialMessages);
  const [draftMessages, setDraftMessages] = useState(initialMessages);
  const [query, setQuery] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  const [lockedFilter, setLockedFilter] = useState<{
    keys: string[];
    locale: Locale;
    missingOnly: boolean;
    query: string;
  } | null>(null);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const filterSignatureRef = useRef("");
  const t = (key: TranslationKey, values?: Record<string, string | number>) =>
    translate(draftMessages[activeLocale], key, values);

  const englishKeys = useMemo(() => sortKeys(savedMessages.en), [savedMessages.en]);
  const hasChanges = useMemo(
    () => JSON.stringify(savedMessages[activeLocale]) !== JSON.stringify(draftMessages[activeLocale]),
    [activeLocale, draftMessages, savedMessages],
  );

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!hasChanges) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  const liveFilteredKeys = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return englishKeys.filter((key) => {
      const value = draftMessages[activeLocale][key] ?? "";
      const englishValue = savedMessages.en[key] ?? "";
      const isMissing = activeLocale !== "en" && !value.trim();
      if (missingOnly && !isMissing) return false;
      if (!normalizedQuery) return true;
      return (
        key.toLowerCase().includes(normalizedQuery) ||
        value.toLowerCase().includes(normalizedQuery) ||
        englishValue.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeLocale, draftMessages, englishKeys, missingOnly, query, savedMessages.en]);
  const filterSignature = `${activeLocale}|${missingOnly ? "missing" : "all"}|${query.trim().toLowerCase()}`;
  const lockedFilterSignature = lockedFilter
    ? `${lockedFilter.locale}|${lockedFilter.missingOnly ? "missing" : "all"}|${lockedFilter.query.trim().toLowerCase()}`
    : "";
  const filteredKeys =
    lockedFilter && lockedFilterSignature === filterSignature
      ? lockedFilter.keys
      : liveFilteredKeys;

  useEffect(() => {
    if (filterSignatureRef.current === filterSignature) return;
    filterSignatureRef.current = filterSignature;
    setLockedFilter({
      keys: liveFilteredKeys,
      locale: activeLocale,
      missingOnly,
      query,
    });
  }, [activeLocale, filterSignature, liveFilteredKeys, missingOnly, query]);

  const groupedKeys = useMemo(
    () =>
      sections.map((section) => ({
        section,
        keys: filteredKeys.filter((key) => getSection(key).id === section.id),
      })),
    [filteredKeys],
  );

  function updateValue(key: string, value: string) {
    setDraftMessages((current) => ({
      ...current,
      [activeLocale]: {
        ...current[activeLocale],
        [key]: value,
      },
    }));
  }

  function resetValue(key: string) {
    setDraftMessages((current) => ({
      ...current,
      [activeLocale]: {
        ...current[activeLocale],
        [key]: savedMessages[activeLocale][key] ?? "",
      },
    }));
  }

  async function save() {
    setIsSaving(true);
    setStatus(null);
    try {
      const response = await fetch(`/api/admin/translations/${activeLocale}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: draftMessages[activeLocale] }),
      });
      const data = (await response.json()) as { messages?: Messages; error?: string };
      if (!response.ok || !data.messages) {
        throw new Error(data.error ?? t("translations.saveFailed"));
      }
      setSavedMessages((current) => ({ ...current, [activeLocale]: data.messages! }));
      setDraftMessages((current) => ({ ...current, [activeLocale]: data.messages! }));
      setLockedFilter(null);
      setStatus({ kind: "success", text: t("translations.saved") });
    } catch (error) {
      setStatus({
        kind: "error",
        text: error instanceof Error ? error.message : t("translations.saveFailed"),
      });
    } finally {
      setIsSaving(false);
    }
  }

  function exportLocale() {
    const blob = new Blob([`${JSON.stringify(draftMessages[activeLocale], null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `webpages-${activeLocale}-translations.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importLocale(file: File | undefined) {
    if (!file) return;
    setStatus(null);
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!validateImport(parsed)) {
        throw new Error(t("translations.invalidImport"));
      }
      const replace = window.confirm(
        t("translations.importConfirm", {
          count: Object.keys(parsed).length,
          locale: localeLabels[activeLocale],
        }),
      );
      if (!replace) return;
      setDraftMessages((current) => ({ ...current, [activeLocale]: parsed }));
      setLockedFilter(null);
      setStatus({ kind: "success", text: t("translations.importLoaded") });
    } catch (error) {
      setStatus({
        kind: "error",
        text: error instanceof Error ? error.message : t("translations.importFailed"),
      });
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  const missingCount = englishKeys.filter((key) => activeLocale !== "en" && !draftMessages[activeLocale][key]?.trim()).length;
  const shouldOpenMatches = query.trim().length > 0 || missingOnly;
  const firstVisibleSectionId = groupedKeys.find(({ keys }) => keys.length > 0)?.section.id;

  return (
    <div className="saas-translations-manager">
      <section className="saas-translations-toolbar">
        <div className="saas-translations-tabs" role="tablist" aria-label={t("translations.languageTabsLabel")}>
          {supportedLocales.map((locale) => (
            <button
              className={activeLocale === locale ? "is-active" : ""}
              key={locale}
              onClick={() => setActiveLocale(locale)}
              role="tab"
              type="button"
            >
              {localeLabels[locale]}
            </button>
          ))}
        </div>
        <div className="saas-translations-actions">
          <button className="saas-auth-secondary-button" onClick={exportLocale} type="button">
            <Download size={15} /> {t("translations.exportJson")}
          </button>
          <button className="saas-auth-secondary-button" onClick={() => importInputRef.current?.click()} type="button">
            <Upload size={15} /> {t("translations.importJson")}
          </button>
          <input
            accept="application/json,.json"
            hidden
            onChange={(event) => importLocale(event.target.files?.[0])}
            ref={importInputRef}
            type="file"
          />
          <button className="saas-auth-submit" disabled={!hasChanges || isSaving} onClick={save} type="button">
            {isSaving ? t("translations.saving") : t("translations.saveChanges")}
          </button>
        </div>
      </section>

      <section className="saas-translations-filters">
        <label className="saas-translations-search">
          <Search size={16} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("translations.searchPlaceholder")}
            value={query}
          />
        </label>
        <label className="saas-translations-toggle">
          <input
            checked={missingOnly}
            disabled={activeLocale === "en"}
            onChange={(event) => setMissingOnly(event.target.checked)}
            type="checkbox"
          />
          {t("translations.missingOnly")}
        </label>
        <span>{t("translations.keysShown", { count: filteredKeys.length })}</span>
        {activeLocale !== "en" && <span>{t("translations.missingCount", { count: missingCount })}</span>}
        {hasChanges && <strong>{t("translations.unsavedChanges")}</strong>}
      </section>

      {status && <p className={status.kind === "success" ? "saas-auth-success" : "saas-auth-error"}>{status.text}</p>}

      <div className="saas-translations-sections">
        {groupedKeys.map(({ section, keys }) =>
          keys.length > 0 ? (
            <details
              className="saas-translations-section"
              key={section.id}
              open={shouldOpenMatches && section.id === firstVisibleSectionId}
            >
              <summary className="saas-phase-one-section-heading">
                <div>
                  <span>{t(section.titleKey)}</span>
                  <h2>{t("translations.sectionCount", { count: keys.length })}</h2>
                </div>
                <span className="saas-translations-chevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="saas-translations-list">
                {keys.map((key) => {
                  const value = draftMessages[activeLocale][key] ?? "";
                  const savedValue = savedMessages[activeLocale][key] ?? "";
                  const changed = value !== savedValue;
                  const missing = activeLocale !== "en" && !value.trim();
                  return (
                    <label className={`saas-translation-row${missing ? " is-missing" : ""}`} key={key}>
                      <span>
                        <strong>{key}</strong>
                        {activeLocale !== "en" && (
                          <small>{t("translations.englishReference", { text: savedMessages.en[key] ?? "" })}</small>
                        )}
                      </span>
                      <textarea
                        onChange={(event) => updateValue(key, event.target.value)}
                        rows={Math.max(2, Math.min(5, Math.ceil(value.length / 70)))}
                        value={value}
                      />
                      <button
                        aria-label={t("translations.resetValue", { key })}
                        disabled={!changed}
                        onClick={() => resetValue(key)}
                        type="button"
                      >
                        <RotateCcw size={15} />
                      </button>
                    </label>
                  );
                })}
              </div>
            </details>
          ) : null,
        )}
      </div>
    </div>
  );
}
