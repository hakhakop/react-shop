import { expect, test } from "@playwright/test";
import type { BuilderLayout } from "@/lib/builderLayouts";
import { resolveHeaderBuilderComposition } from "@/lib/headerBuilderComposition";
import { updateCanonicalBuilderRow } from "@/lib/builderRowEditing";

const headerLayout = (): BuilderLayout => ({
  version: 1,
  key: "header",
  page: "header",
  sections: [{
    id: "header-document",
    kind: "contentLayout",
    title: "Header",
    background: "transparent",
    visible: true,
    rows: [
      {
        id: "header-toolbar-row",
        role: "toolbar",
        layout: "whole",
        maxWidth: "default",
        horizontalDistribution: "center",
        columns: [{
          id: "header-toolbar-column",
          elements: [{ id: "toolbar-button", kind: "button", buttonLabel: "Toolbar action" }],
        }],
      },
      {
        id: "header-main-row",
        layout: "halves",
        columns: [
          { id: "header-main-left", elements: [{ id: "header-logo", kind: "image", imageUrl: "/logo.svg" }] },
          { id: "header-main-right", elements: [{ id: "header-navigation", kind: "menu" }] },
        ],
      },
    ],
  }],
  updatedAt: new Date(0).toISOString(),
});

test("canonical Toolbar is an ordinary Header row with normal columns and elements", () => {
  const layout = headerLayout();
  const composition = resolveHeaderBuilderComposition(layout);

  expect(composition.rows).toContainEqual(expect.objectContaining({
    rowId: "header-toolbar-row",
    role: "toolbar",
    maxWidth: "default",
    horizontalDistribution: "center",
  }));
  expect(composition.columns).toContainEqual(expect.objectContaining({
    id: "header-toolbar-column",
    rowId: "header-toolbar-row",
  }));
  expect(composition.elements).toContainEqual(expect.objectContaining({
    id: "toolbar-button",
    rowId: "header-toolbar-row",
    columnId: "header-toolbar-column",
    type: "button",
  }));
});

test("changing or removing Toolbar role preserves the ordinary Row contents", () => {
  const section = headerLayout().sections[0]!;
  const changed = updateCanonicalBuilderRow(section, 0, {
    role: undefined,
    maxWidth: "large",
    horizontalDistribution: "left",
  });
  const row = changed.rows?.[0];

  expect(row).toMatchObject({
    id: "header-toolbar-row",
    maxWidth: "large",
    horizontalDistribution: "left",
  });
  expect(row?.role).toBeUndefined();
  expect(row?.columns[0]?.elements).toEqual([
    expect.objectContaining({ id: "toolbar-button", buttonLabel: "Toolbar action" }),
  ]);
});

test("Headers without a Toolbar row retain their existing composition", () => {
  const layout = headerLayout();
  layout.sections[0]!.rows = layout.sections[0]!.rows?.slice(1);
  const composition = resolveHeaderBuilderComposition(layout);

  expect(composition.rows?.some((row) => row.role === "toolbar")).toBe(false);
  expect(composition.elements.map((element) => element.id)).toEqual([
    "header-logo",
    "header-navigation",
  ]);
});
