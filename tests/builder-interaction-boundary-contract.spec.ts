import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

const root = process.cwd();
const boundarySource = fs.readFileSync(
  path.join(root, "components/dashboard/builderInteractionBoundary.ts"),
  "utf8",
);
const builderSource = fs.readFileSync(
  path.join(root, "components/dashboard/DashboardBuilder.tsx"),
  "utf8",
);
const iframeBridgeSource = fs.readFileSync(
  path.join(root, "components/builder/BuilderIframeSelectionBridge.tsx"),
  "utf8",
);
const scopedRouterSource = fs.readFileSync(
  path.join(root, "components/builder/ScopedPreviewLinkRouter.tsx"),
  "utf8",
);

test("Builder scopes capture-phase interaction suppression to the editable canvas", () => {
  expect(boundarySource).toContain("BUILDER_PREVIEW_INTERACTIVE_SELECTOR");
  expect(boundarySource).toContain("shouldSuppressBuilderNavigation");
  expect(boundarySource).toContain("shouldSuppressBuilderKeyboardNavigation");
  expect(boundarySource).toContain("resolveBuilderOpenLinkIntent");
  expect(boundarySource).toContain("event.defaultPrevented");
  expect(boundarySource).toContain("[contenteditable=\\\"true\\\"]");

  expect(builderSource).toContain("onClickCapture={handleBuilderNavigationCapture}");
  expect(builderSource).toContain("onKeyDownCapture={handleBuilderKeyboardCapture}");
  expect(builderSource).toContain("onSubmitCapture={(event) => {");
  expect(builderSource).toContain('data-builder-editable-canvas="true"');
  expect(builderSource).toContain("Navigation suppression belongs to the rendered Builder");
  expect(builderSource).toContain("event.preventDefault();");

  const previewShellStart = builderSource.indexOf("className={`builder-preview-shell");
  const editableCanvasStart = builderSource.indexOf('data-builder-editable-canvas="true"');
  expect(previewShellStart).toBeGreaterThanOrEqual(0);
  expect(editableCanvasStart).toBeGreaterThan(previewShellStart);
  expect(builderSource.slice(previewShellStart, editableCanvasStart)).not.toContain("onClickCapture");
});

test("preview whitelist is explicit and destination resolution is deferred", () => {
  expect(boundarySource).toContain(".shop-builder-swiper button");
  expect(boundarySource).toContain("[data-builder-preview-interactive=\\\"true\\\"]");
  expect(boundarySource).toContain(".shop-builder-column-block--accordion .uk-accordion-title");
  expect(boundarySource).toContain(".shop-builder-products button");
  expect(boundarySource).toContain(".shop-builder-grid-wrapper button");
  expect(boundarySource).toContain('future explicit "Open link" action');
});

test("multi-item links retain the clicked action instead of using the first child link", () => {
  expect(builderSource).toContain("selectedLinkIntent");
  expect(builderSource).toContain("blockLinks.length === 1");
  expect(builderSource).toContain("never silently");
  expect(builderSource).toContain("builderTargetsEqual(selectedLinkIntent.owner, target)");
  expect(iframeBridgeSource).toContain("selectedLinkHref !== href");
  expect(iframeBridgeSource).toContain("linkLabel");
  expect(scopedRouterSource).toContain('if (mode === "builder") return');
});
