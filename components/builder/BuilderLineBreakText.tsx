import { normalizeBuilderLineBreaks } from "@/lib/builderText";

export default function BuilderLineBreakText({ text }: { text: string }) {
  return (
    <span style={{ whiteSpace: "pre-line" }}>
      {normalizeBuilderLineBreaks(text)}
    </span>
  );
}
