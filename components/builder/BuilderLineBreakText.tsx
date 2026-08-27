import { normalizeBuilderLineBreaks } from "@/lib/builderText";
import { decodeHtmlEntities } from "@/lib/safeHtml";
import type { CSSProperties } from "react";

export default function BuilderLineBreakText({ text, className, style }: { text: string; className?: string; style?: CSSProperties }) {
  return (
    <span className={className} style={{ whiteSpace: "pre-line", fontSize: "inherit", fontFamily: "inherit", fontWeight: "inherit", lineHeight: "inherit", letterSpacing: "inherit", color: "inherit", ...style }}>
      {normalizeBuilderLineBreaks(decodeHtmlEntities(text))}
    </span>
  );
}
