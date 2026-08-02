import { normalizeBuilderLineBreaks } from "@/lib/builderText";

export default function BuilderLineBreakText({ text }: { text: string }) {
  return (
    <span style={{ whiteSpace: "pre-line", fontSize: "inherit", fontFamily: "inherit", fontWeight: "inherit", lineHeight: "inherit", letterSpacing: "inherit", color: "inherit" }}>
      {normalizeBuilderLineBreaks(text)}
    </span>
  );
}
