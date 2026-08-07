"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitTableClass } from "@/lib/uikitTokens";

type Props = {
  block: any;
};

export default function UikitTable({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const headings: string[] = rawBlock.tableHeadings ?? ["Header 1", "Header 2", "Header 3"];
  const rows: string[][] = rawBlock.tableRows ?? [
    ["Item A", "Description A", "$10.00"],
    ["Item B", "Description B", "$20.00"],
  ];

  const tableClass = getUikitTableClass(
    rawBlock.tableStyle,
    rawBlock.size,
    rawBlock.tableHover,
    rawBlock.tableStriped
  );

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const textAlignClass = rawBlock.textAlign && rawBlock.textAlign !== "none" ? `uk-text-${rawBlock.textAlign}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--table ${marginClass} ${textAlignClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <div style={{ overflowX: "auto" }}>
        <table className={tableClass}>
          {headings.length > 0 && (
            <thead>
              <tr>
                {headings.map((heading, hIdx) => (
                  <th key={hIdx}>{heading}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx}>
                {Array.from(
                  { length: Math.max(headings.length, row.length) },
                  (_, cIdx) => (
                    <td key={cIdx}>{row[cIdx] ?? ""}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
