import { expect, test } from "@playwright/test";

import type { BuilderRow, BuilderSection } from "@/components/dashboard/builderTypes";
import { rebaseMaterializedRowPresentation } from "@/lib/builderPreviewProjection";

const row = (overrides: Partial<BuilderRow> = {}): BuilderRow => ({
  id: "row-1",
  layout: "1-1",
  columns: [{ id: "column-1", elements: [] }],
  ...overrides,
});

const section = (rows: BuilderRow[]): BuilderSection => ({
  id: "section-1",
  kind: "contentLayout",
  title: "Section",
  background: "default",
  visible: true,
  rows,
});

test.describe("materialized preview row presentation", () => {
  test("uses the current authored max width without replacing projected content", () => {
    const authored = section([row({ maxWidth: "expand" })]);
    const projected = section([row({
      maxWidth: "none",
      columns: [{
        id: "column-1",
        elements: [{ id: "resolved-product", kind: "heading" }],
      }],
    })]);

    const [result] = rebaseMaterializedRowPresentation([authored], [projected]);

    expect(result.rows?.[0]?.maxWidth).toBe("expand");
    expect(result.rows?.[0]?.columns[0]?.elements[0]?.id).toBe("resolved-product");
  });

  test("rebases repeated dynamic row ids onto their authored template", () => {
    const authored = section([row({
      id: "product-row",
      maxWidth: "none",
      dynamicContext: {
        provider: "woocommerce",
        source: "product",
        mode: "collection",
      },
    })]);
    const projected = section([row({
      id: "product-row--dynamic-abc",
      maxWidth: "expand",
    })]);

    const [result] = rebaseMaterializedRowPresentation([authored], [projected]);

    expect(result.rows?.[0]?.id).toBe("product-row--dynamic-abc");
    expect(result.rows?.[0]?.maxWidth).toBe("none");
  });

  test("clears an older projected max width when authored None is omitted", () => {
    const authored = section([row()]);
    const projected = section([row({ maxWidth: "expand" })]);

    const [result] = rebaseMaterializedRowPresentation([authored], [projected]);

    expect(result.rows?.[0]?.maxWidth).toBeUndefined();
  });
});
