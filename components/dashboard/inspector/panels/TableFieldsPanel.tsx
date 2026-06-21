// @ts-nocheck
"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";

export default function TableFieldsPanel() {
  const { selectedLayoutBlock, updateSelectedLayoutBlockByKey } = useInspector();

  if (!selectedLayoutBlock || selectedLayoutBlock.kind !== "table") return null;

  const block = selectedLayoutBlock;

  return (
    <div className="builder-inspector-stack">
      <div className="builder-inspector-section">
        <label className="builder-field">
          <span>Table style</span>
          <select
            value={block.tableStyle ?? "striped"}
            onChange={(event) =>
              updateSelectedLayoutBlockByKey({
                tableStyle: event.target.value as "striped" | "bordered" | "plain",
              })
            }
          >
            <option value="striped">Striped rows</option>
            <option value="bordered">Bordered</option>
            <option value="plain">Plain</option>
          </select>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <label className="builder-field" style={{ flex: 1 }}>
            <span>Columns</span>
            <input
              type="number"
              min={1}
              max={10}
              value={(block.tableHeadings ?? []).length || 1}
              onChange={(event) => {
                const newCount = Math.max(1, Number(event.target.value) || 1);
                const headings = [...(block.tableHeadings ?? [])];
                const rows = (block.tableRows ?? []).map((r) => [...r]);
                while (headings.length < newCount) headings.push(`Column ${headings.length + 1}`);
                while (headings.length > newCount) headings.pop();
                for (let r = 0; r < rows.length; r++) {
                  while (rows[r].length < newCount) rows[r].push(`Cell ${String.fromCharCode(65 + rows[r].length)}`);
                  while (rows[r].length > newCount) rows[r].pop();
                }
                updateSelectedLayoutBlockByKey({ tableHeadings: headings, tableRows: rows });
              }}
            />
          </label>
          <label className="builder-field" style={{ flex: 1 }}>
            <span>Rows</span>
            <input
              type="number"
              min={0}
              max={20}
              value={block.tableRows?.length ?? 0}
              onChange={(event) => {
                const newCount = Math.max(0, Number(event.target.value) || 0);
                const colCount = (block.tableHeadings ?? []).length || 3;
                const rows = (block.tableRows ?? []).map((r) => [...r]);
                while (rows.length < newCount) rows.push(Array.from({ length: colCount }, (_, i) => `Cell ${String.fromCharCode(65 + i)}`));
                while (rows.length > newCount) rows.pop();
                updateSelectedLayoutBlockByKey({ tableRows: rows });
              }}
            />
          </label>
        </div>
        {(block.tableHeadings ?? []).length > 0 && (
          <>
            <div className="builder-section-heading" style={{ marginTop: 12 }}>
              <span>Headings</span>
            </div>
            {(block.tableHeadings ?? []).map((heading, hIdx) => (
              <label key={hIdx} className="builder-field">
                <span>Col {hIdx + 1}</span>
                <input
                  value={heading}
                  onChange={(event) => {
                    const headings = [...(block.tableHeadings ?? [])];
                    headings[hIdx] = event.target.value;
                    updateSelectedLayoutBlockByKey({ tableHeadings: headings });
                  }}
                />
              </label>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
