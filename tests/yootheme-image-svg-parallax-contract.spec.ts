import { expect, test, type Page } from "@playwright/test";
import enterprise8 from "@/tests/fixtures/yootheme-compatibility/sources/enterprise8.json";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { createYoothemePageImportReport } from "@/lib/yoothemeImportReport";
import {
  getUikitSvgColor,
  getUikitSvgColorClass,
  UIKIT_YOOTHEME_SVG_COLOR_OPTIONS,
  resolveUikitImageSemantics,
  getUikitImageClass,
  getUikitImageWrapperClass,
} from "@/lib/uikitTokens";
import {
  formatFreshImportAcceptanceResult,
  runRegisteredYoothemeFreshImportAcceptance,
  type FreshImportCheck,
} from "@/tests/support/yoothemeFreshImportAcceptance";
import {
  extractSafeSvgDropShadow,
  extractSafeSvgTransformOrigin,
} from "@/components/builder/UikitStylableSvg";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";

test.describe.configure({ mode: "serial" });

test("YOOtheme Image keeps its SVG vocabulary and canonical media presentation values", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{
          type: "column",
          children: [{
            type: "image",
            props: {
              image: "wp-content/uploads/yootheme/example.svg",
              image_svg_inline: true,
              image_svg_color: "danger",
              image_box_shadow: "large",
              image_box_decoration: "primary",
            },
          }],
        }],
      }],
    }],
  });
  const image = (mapped.sections[0]?.rows?.[0]?.columns?.[0]?.elements?.[0] ?? mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0]) as Record<string, unknown> | undefined;

  expect(image).toMatchObject({
    kind: "image",
    imageSvgInline: true,
    imageSvgColor: "danger",
    imageShadow: "large",
    imageBoxShadow: "large",
    imageBoxDecoration: "primary",
  });
  expect(UIKIT_YOOTHEME_SVG_COLOR_OPTIONS.map((option) => option.value)).toEqual([
    "none", "muted", "emphasis", "primary", "secondary", "success", "warning", "danger",
  ]);
  expect(getUikitSvgColorClass("danger")).toBe("uk-text-danger");
  expect(getUikitSvgColor("none")).toBeUndefined();
  expect(getUikitSvgColor("danger")).toContain("--uk-global-danger-background");

  // Shadow and box decoration parity
  const bottomMapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{
          type: "column",
          children: [{
            type: "image",
            props: {
              image: "wp-content/uploads/yootheme/example.svg",
              image_box_shadow: "bottom",
              image_box_decoration: "shadow",
            },
          }],
        }],
      }],
    }],
  });
  const bottomImage = (bottomMapped.sections[0]?.rows?.[0]?.columns?.[0]?.elements?.[0] ?? bottomMapped.sections[0]?.layoutItems?.[0]?.blocks?.[0]) as Record<string, unknown> | undefined;
  expect(bottomImage).toMatchObject({
    kind: "image",
    imageShadow: "bottom",
    imageBoxShadow: "bottom",
    imageBoxDecoration: "shadow",
  });

  // Floating shadow alias normalizes to shadow
  const floatingMapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{
          type: "column",
          children: [{
            type: "image",
            props: {
              image: "wp-content/uploads/yootheme/example.svg",
              image_box_decoration: "floating-shadow",
            },
          }],
        }],
      }],
    }],
  });
  const floatingImage = (floatingMapped.sections[0]?.rows?.[0]?.columns?.[0]?.elements?.[0] ?? floatingMapped.sections[0]?.layoutItems?.[0]?.blocks?.[0]) as Record<string, unknown> | undefined;
  expect(floatingImage).toMatchObject({
    kind: "image",
    imageBoxDecoration: "shadow",
  });

  // UIkit shadow semantics and class generation
  for (const shadowVal of ["small", "medium", "large", "xlarge", "bottom"]) {
    const semantics = resolveUikitImageSemantics({
      imageShadow: shadowVal,
      imageShape: "rounded",
    });
    expect(semantics.shadow).toBe(shadowVal);
    expect(getUikitImageClass(semantics)).toContain(`uk-box-shadow-${shadowVal}`);
    expect(getUikitImageWrapperClass(semantics)).toContain(`uk-box-shadow-${shadowVal}`);
  }
});

test("YOOtheme inline SVG accepts only asset-authored drop-shadow filters", () => {
  const source = `<svg><style>img + svg { filter: drop-shadow(20px 20px 20px rgba(60, 65, 124, 0.12)) drop-shadow(-20px -20px 20px rgba(255, 255, 255, 0.9)); }</style></svg>`;
  expect(extractSafeSvgDropShadow(source)).toBe(
    "drop-shadow(20px 20px 20px rgba(60, 65, 124, 0.12)) drop-shadow(-20px -20px 20px rgba(255, 255, 255, 0.9))",
  );
  expect(extractSafeSvgDropShadow(`<svg><style>svg { filter: url(https://example.test/filter); }</style></svg>`)).toBeUndefined();
});

test("YOOtheme inline SVG accepts only safe parallax transform origins", () => {
  expect(extractSafeSvgTransformOrigin("transform-origin: 50% 50%; transform: translate(0 -200px)"))
    .toBe("50% 50%");
  expect(extractSafeSvgTransformOrigin("transform-origin: center bottom"))
    .toBe("center bottom");
  expect(extractSafeSvgTransformOrigin("transform-origin: calc(50% + 1px) 50%"))
    .toBeUndefined();
  expect(extractSafeSvgTransformOrigin("transform-origin: 50% 50%; background: url(javascript:alert(1))"))
    .toBe("50% 50%");
});

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

function importedBlocks(): Array<Record<string, any>> {
  return mapYoothemeStaticContent(enterprise8).sections.flatMap((section: any) =>
    (section.rows ?? []).flatMap((row: any) =>
      (row.columns ?? []).flatMap((col: any) => col.elements ?? [])
    ).concat((section.layoutItems ?? []).flatMap((item: any) => item.blocks ?? []))
  ).filter(Boolean) as Array<Record<string, any>>;
}

test("Enterprise8 parallax is imported with its compound parallax settings", () => {
  const floatingSvg = importedBlocks().find((block) =>
    block.kind === "image" && block.imageUrl?.includes("enterprise-feature-efficient-workflow-floating-icon.svg"),
  );
  expect(floatingSvg).toBeTruthy();
  expect(floatingSvg?.animation).toMatchObject({
    preset: "parallax",
  });
});

type SvgProbe = {
  intrinsic: { sourceWidth: number; sourceHeight: number; width: number; height: number; parentWidth: number } | null;
  explicit: { width: number; hostWidth: number; declaredWidth: string | null; preservedFill: string | null } | null;
  targets: { intrinsic: string; explicit: string };
};

function findPersistedImage(document: unknown, assetName: string): Record<string, unknown> | undefined {
  const visit = (value: unknown): Record<string, unknown> | undefined => {
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = visit(item);
        if (found) return found;
      }
      return undefined;
    }
    if (!value || typeof value !== "object") return undefined;
    const record = value as Record<string, unknown>;
    if (
      record.kind === "image"
      && typeof record.imageUrl === "string"
      && record.imageUrl.includes(assetName)
    ) return record;
    for (const child of Object.values(record)) {
      const found = visit(child);
      if (found) return found;
    }
    return undefined;
  };
  return visit(document);
}

async function probeSvgGeometry(page: Page, intrinsicBlockId: string, explicitBlockId: string): Promise<SvgProbe> {
  await page.evaluate(({ intrinsicBlockId: intrinsicId, explicitBlockId: explicitId }) => {
    for (const id of [intrinsicId, explicitId]) {
      const block = document.getElementById(id)
        ?? document.querySelector<HTMLElement>(`[data-builder-block-id="${id}"], [data-builder-block-key="${id}"]`);
      block?.scrollIntoView({ block: "center", inline: "nearest" });
    }
  }, { intrinsicBlockId, explicitBlockId });
  await page.waitForFunction(({ intrinsicBlockId: intrinsicId, explicitBlockId: explicitId }) => {
    const resolve = (id: string) => document.getElementById(id)
      ?? document.querySelector<HTMLElement>(`[data-builder-block-id="${id}"], [data-builder-block-key="${id}"]`);
    return [intrinsicId, explicitId].every((id) =>
      resolve(id)?.querySelector<HTMLElement>(".shop-builder-stylable-svg-host")?.dataset.svgState === "ready",
    );
  }, { intrinsicBlockId, explicitBlockId });
  return page.locator("body").evaluate((_, { intrinsicBlockId, explicitBlockId }) => {
    const findBlock = (blockId: string) => document.getElementById(blockId)
      ?? document.querySelector<HTMLElement>(
        `[data-builder-block-id="${blockId}"], [data-builder-block-key="${blockId}"]`,
      );
    const measureIntrinsic = () => {
      const block = findBlock(intrinsicBlockId);
      const svg = block?.querySelector<SVGSVGElement>(".shop-builder-stylable-svg-host--intrinsic > svg");
      if (!svg) return null;
      const sourceWidth = Number(svg.getAttribute("width"));
      const sourceHeight = Number(svg.getAttribute("height"));
      const rect = svg.getBoundingClientRect();
      const parentWidth = svg.parentElement?.parentElement?.getBoundingClientRect().width ?? 0;
      return { sourceWidth, sourceHeight, width: rect.width, height: rect.height, parentWidth };
    };
    const measureExplicit = () => {
      const block = findBlock(explicitBlockId);
      const host = block?.querySelector<HTMLElement>(".shop-builder-stylable-svg-host");
      const svg = host?.querySelector<SVGSVGElement>("svg");
      const figure = host?.closest("figure");
      if (!host || !figure) return null;
      return {
        width: figure.getBoundingClientRect().width,
        hostWidth: host.getBoundingClientRect().width,
        declaredWidth: svg?.getAttribute("width") ?? null,
        preservedFill: svg?.querySelector(".uk-preserve")?.getAttribute("fill") ?? null,
      };
    };
    const describe = (blockId: string) => {
      const block = findBlock(blockId);
      if (!block) return "missing-block";
      const host = block.querySelector(".shop-builder-stylable-svg-host");
      const image = block.querySelector("img");
      return `host=${host ? `${host.className}; state=${host.getAttribute("data-svg-state")}; content=${host.innerHTML.slice(0, 80)}` : "none"}; img=${image?.getAttribute("src") ?? "none"}; class=${block.className}`;
    };
    return {
      intrinsic: measureIntrinsic(),
      explicit: measureExplicit(),
      targets: { intrinsic: describe(intrinsicBlockId), explicit: describe(explicitBlockId) },
    };
  }, { intrinsicBlockId, explicitBlockId });
}

test("Enterprise8 inline SVG preserves source geometry when un-sized while explicit Image width still wins in Builder and storefront", async ({ page }) => {
  const result = await runRegisteredYoothemeFreshImportAcceptance({
    page,
    context: page.context(),
    fixtureId: "enterprise8",
    authenticate: signIn,
    probe: async ({ builder, storefront, persisted }) => {
      const intrinsicBlock = findPersistedImage(persisted, "enterprise-feature-efficient-workflow-floating-icon.svg");
      const explicitBlock = findPersistedImage(persisted, "enterprise-feature-api.svg");
      const intrinsicBlockId = typeof intrinsicBlock?.id === "string" ? intrinsicBlock.id : undefined;
      const explicitBlockId = typeof explicitBlock?.id === "string" ? explicitBlock.id : undefined;
      if (!intrinsicBlockId || !explicitBlockId) {
        return [{
          capability: "image.svg-fixture-targets",
          outcome: "BLOCKED",
          expected: "Enterprise8 persisted import contains the selected intrinsic and explicit SVG image blocks",
          actual: `intrinsic=${intrinsicBlockId ?? "missing"}; explicit=${explicitBlockId ?? "missing"}`,
        }];
      }
      const [builderProbe, storefrontProbe] = await Promise.all([
        probeSvgGeometry(builder, intrinsicBlockId, explicitBlockId),
        probeSvgGeometry(storefront, intrinsicBlockId, explicitBlockId),
      ]);
      const matchesSourceIntrinsicGeometry = (probe: SvgProbe) => Boolean(
        probe.intrinsic
        && probe.intrinsic.sourceWidth > 0
        && probe.intrinsic.sourceHeight > 0
        && Math.abs(probe.intrinsic.width - Math.min(probe.intrinsic.sourceWidth, probe.intrinsic.parentWidth)) <= 1
        && Math.abs((probe.intrinsic.width / probe.intrinsic.height) - (probe.intrinsic.sourceWidth / probe.intrinsic.sourceHeight)) <= 0.01,
      );
      const explicitWidthWins = (probe: SvgProbe) => Boolean(
        probe.explicit
        && Math.abs(probe.explicit.width - 370) <= 1
        && Math.abs(probe.explicit.hostWidth - 370) <= 1,
      );
      const preservesAuthoredSvgPaint = (probe: SvgProbe) => probe.explicit?.preservedFill === "#f7f8fc";
      const checks: FreshImportCheck[] = [
        {
          capability: "image.svg-intrinsic-size",
          outcome: matchesSourceIntrinsicGeometry(builderProbe) && matchesSourceIntrinsicGeometry(storefrontProbe) ? "PASS" : "FAIL",
          expected: "no-width inline SVG keeps its source/viewBox geometry, constrained only by its containing column",
          actual: `Builder=${JSON.stringify(builderProbe.intrinsic)} (${JSON.stringify(builderProbe.targets.intrinsic)}); storefront=${JSON.stringify(storefrontProbe.intrinsic)} (${JSON.stringify(storefrontProbe.targets.intrinsic)}); persisted=${JSON.stringify({ imageWidth: intrinsicBlock?.imageWidth, imageHeight: intrinsicBlock?.imageHeight, imageRatio: intrinsicBlock?.imageRatio, imageFit: intrinsicBlock?.imageFit, imageSvgInline: intrinsicBlock?.imageSvgInline })}`,
        },
        {
          capability: "image.svg-explicit-width",
          outcome: explicitWidthWins(builderProbe) && explicitWidthWins(storefrontProbe) ? "PASS" : "FAIL",
          expected: "authored Enterprise8 image_width=370 remains the explicit media width",
          actual: `Builder=${JSON.stringify(builderProbe.explicit)} (${JSON.stringify(builderProbe.targets.explicit)}); storefront=${JSON.stringify(storefrontProbe.explicit)} (${JSON.stringify(storefrontProbe.targets.explicit)})`,
        },
        {
          capability: "image.svg-preserved-paint",
          outcome: preservesAuthoredSvgPaint(builderProbe) && preservesAuthoredSvgPaint(storefrontProbe) ? "PASS" : "FAIL",
          expected: "UIkit .uk-preserve artwork retains the source #f7f8fc fill while SVG Color = Emphasis colors only non-preserved shapes",
          actual: `Builder=${builderProbe.explicit?.preservedFill ?? "missing"}; storefront=${storefrontProbe.explicit?.preservedFill ?? "missing"}`,
        },
      ];
      return checks;
    },
  });

  expect(result.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
  expect(result.restoration.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
});
