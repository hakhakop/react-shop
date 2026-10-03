import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("context-aware preview rematerialization is owned by authored revisions", async () => {
  const source = await readFile(path.join(process.cwd(), "components/dashboard/DashboardBuilder.tsx"), "utf8");

  expect(source).toContain("const authoredRevisionSignature = useMemo(");
  expect(source).toContain("JSON.stringify(builderState)");
  expect(source).toContain('builderEditorContext?.content.mode === "preview"');
  expect(source).toContain('builderEditorContext?.content.mode === "fixed"');
  expect(source).toContain("authoredRefreshTimerRef");
  expect(source).toContain("window.setTimeout(() => {");
  expect(source).toContain("requestId !== dynamicPreviewRequestRef.current");
  expect(source).toContain("JSON.stringify(builderStateRef.current) !== requestedSignature");
});

test("the refresh boundary does not special-case structural mutation types", async () => {
  const source = await readFile(path.join(process.cwd(), "components/dashboard/DashboardBuilder.tsx"), "utf8");
  const refreshEffect = source.slice(source.indexOf("const authoredRevisionSignature = useMemo("), source.indexOf("const publishLayout = async () =>"));

  expect(refreshEffect).not.toContain("Add Section");
  expect(refreshEffect).not.toContain("addSection");
  expect(refreshEffect).not.toContain("Heading");
  expect(refreshEffect).toContain("authoredRevisionSignature");
});

test("a remounted iframe draft receiver always receives a fresh snapshot", async () => {
  const source = await readFile(path.join(process.cwd(), "components/dashboard/DashboardBuilder.tsx"), "utf8");
  const readyHandlerStart = source.indexOf("event.data.type === BUILDER_IFRAME_DRAFT_READY_MESSAGE");
  const readyHandlerEnd = source.indexOf("event.data.type === BUILDER_IFRAME_DRAFT_ACK_MESSAGE", readyHandlerStart);
  const readyHandler = source.slice(readyHandlerStart, readyHandlerEnd);

  expect(readyHandler).toContain("postIframeDraftSnapshot(readyState, true)");
});
