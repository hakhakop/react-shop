import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

test("Structure panel source adheres to Section → Row → Column → Element vertical outline contract", () => {
  const panelSource = readFileSync(
    resolve(process.cwd(), "components/dashboard/BuilderWireframePanel.tsx"),
    "utf8",
  );

  // Hierarchy contract
  expect(panelSource).toContain("WireframeSection");
  expect(panelSource).toContain("WireframeRow");
  expect(panelSource).toContain("WireframeColumn");
  expect(panelSource).toContain("WireframeBlock");

  // Semantic tree roles and data-structure-key
  expect(panelSource).toContain('role="tree"');
  expect(panelSource).toContain('role="treeitem"');
  expect(panelSource).toContain("data-structure-key");

  // Exact column element add targeting
  expect(panelSource).toContain("actions.openElements");
  expect(panelSource).toContain("actions.selectColumn");
  expect(panelSource).toContain("builder-structure-empty-target");

  // Progressive disclosure overflow actions
  expect(panelSource).toContain("StructureOverflow");
  expect(panelSource).toContain("actions.moveSection");
  expect(panelSource).toContain("actions.moveRow");
  expect(panelSource).toContain("actions.moveBlock");
  expect(panelSource).toContain("actions.duplicateBlock");
  expect(panelSource).toContain("actions.deleteBlock");
});

test("Structure panel supports sibling column composition bar and portal overlay menus", () => {
  const panelSource = readFileSync(
    resolve(process.cwd(), "components/dashboard/BuilderWireframePanel.tsx"),
    "utf8",
  );
  const cssSource = readFileSync(
    resolve(process.cwd(), "app/styles/dashboard.css"),
    "utf8",
  );

  // Portal-based overflow menu
  expect(panelSource).toContain("createPortal");
  expect(panelSource).toContain("builder-structure-portal-menu");
  expect(cssSource).toContain(".builder-structure-portal-menu");
  expect(cssSource).toContain("position: fixed");
  expect(cssSource).toContain("z-index: 99999");
  expect(cssSource).toContain("width: max-content");

  // Sibling columns composition bar
  expect(panelSource).toContain("builder-structure-row-columns-bar");
  expect(panelSource).toContain("builder-structure-col-segment");
  expect(cssSource).toContain(".builder-structure-row-columns-bar");
  expect(cssSource).toContain(".builder-structure-col-segment");

  // Multi-column vs 1-column row handling
  expect(panelSource).toContain("isMultiColumn");
  expect(panelSource).toContain("activeColumnIndex");
});

test("Structure panel provides consistent contextual insertion affordances where objects are inserted", () => {
  const panelSource = readFileSync(
    resolve(process.cwd(), "components/dashboard/BuilderWireframePanel.tsx"),
    "utf8",
  );
  const cssSource = readFileSync(
    resolve(process.cwd(), "app/styles/dashboard.css"),
    "utf8",
  );

  // Column Add Element button beneath elements (and ambiguous + removed from column header actions)
  expect(panelSource).toContain("builder-structure-add-element-btn");
  expect(panelSource).not.toContain("builder-wireframe-column-add");
  expect(cssSource).toContain(".builder-structure-add-element-btn");

  // Row Add Row affordance between/below rows
  expect(panelSource).toContain("builder-structure-insert-row-slot");
  expect(panelSource).toContain("builder-structure-insert-row-btn");
  expect(cssSource).toContain(".builder-structure-insert-row-btn");

  // Column layout is controlled from row inspector, so ambiguous add column plus buttons are removed from structure outline
  expect(panelSource).not.toContain("builder-structure-insert-col-btn");
});

test("Structure panel and sidebar support YOOtheme canvas representation and robust pointer resize", () => {
  const panelSource = readFileSync(
    resolve(process.cwd(), "components/dashboard/BuilderWireframePanel.tsx"),
    "utf8",
  );
  const sidebarSource = readFileSync(
    resolve(process.cwd(), "components/dashboard/DashboardSidebar.tsx"),
    "utf8",
  );
  const builderSource = readFileSync(
    resolve(process.cwd(), "components/dashboard/DashboardBuilder.tsx"),
    "utf8",
  );
  const cssSource = readFileSync(
    resolve(process.cwd(), "app/styles/dashboard.css"),
    "utf8",
  );

  // Sidebar resize pointer capture
  expect(sidebarSource).toContain("onPointerDown");
  expect(builderSource).toContain("setPointerCapture");
  expect(cssSource).toContain(".builder-dashboard.is-sidebar-resizing iframe");
  expect(cssSource).toContain("pointer-events: none !important");

  // YOOtheme side-by-side row columns and minimal element card design
  expect(panelSource).toContain("builder-structure-row-columns-container");
  expect(panelSource).toContain("builder-structure-element-card");
  expect(cssSource).toContain(".builder-structure-row-columns-container");
  expect(cssSource).toContain(".builder-structure-element-card");

  // Blocks tab renders inside sidebar content without hijacking inspector
  expect(sidebarSource).toContain('sidebarTab === "elements"');
  expect(sidebarSource).toContain("<ElementLibrary");
});



