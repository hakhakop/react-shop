/**
 * Versioned, source-first compatibility contracts for YOOtheme fixtures.
 *
 * A contract records observations from YOOtheme itself. WebPages is only the
 * subject being measured; it never supplies reference values for this layer.
 */

export type CompatibilityCheck = {
  id: string;
  passed: boolean;
  message: string;
};

export type CompatibilityReport = {
  contractId: string;
  passed: boolean;
  checks: CompatibilityCheck[];
};

export type PanelSliderLayoutCompatibilityContract = {
  schemaVersion: 2;
  id: string;
  fixture: {
    fileName: string;
    sha256: string;
    sourcePath: string;
    elementType: "panel-slider";
    sliderDivider: boolean;
    sliderWidth: "" | "fixed";
    sliderWidthDefault: string;
    sliderWidthSmall: string;
    sliderWidthMedium: string;
    sliderWidthLarge: string;
    sliderWidthXLarge: string;
    sliderGap: "" | "small" | "medium" | "default" | "large";
    margin: "" | "small" | "medium" | "large" | "xlarge";
    textAlign: "" | "left" | "center" | "right";
    panelMatch: boolean;
    panelStyle: string;
    panelPadding: string;
    imageWidth: string;
  };
  viewport: { width: number; height: number };
  reference: {
    trackRequiredClasses: string[];
    itemCount: number;
    persistedItemWidthMode: "auto" | "fixed";
    persistedSpaceBetweenPx: number;
    persistedResponsiveItems: {
      phone: number;
      small: number | null;
      medium: number | null;
      large: number | null;
      xlarge: number | null;
    };
    persistedPanelStyle: string;
    persistedPanelSize: string;
    effectiveGapPx: number;
    trackMarginLeftPx: number;
    itemPaddingLeftPx: number;
    effectiveItemGeometry: {
      mode: "intrinsic" | "fixed";
      trackWidthPx: number;
      viewportWidthPx: number;
      trackOverhangPx: number;
      itemWidthsPx: number[];
    };
    divider: {
      borderWidthPx: number;
      insetPx: number;
    };
    panelPaddingPx: [number, number, number, number];
    panelWidthsPx: number[];
    panelHeightsPx: number[];
    overflowX: "clip" | "hidden" | "visible" | "scroll" | "auto";
    allItemsFit: boolean;
    navigationVisible: boolean;
    rootMarginTopPx: number;
    rootMarginBottomPx: number;
    rootTextAlign: string;
    rootRequiredAlignmentClass: string;
    textAlignmentMediaOffsetsPx: {
      left: number;
      center: number;
      right: number;
    };
    itemHeightsPx: number[];
    mediaWidthPx: number;
    mediaHeightPx: number;
  };
  tolerances: {
    geometryPx: number;
  };
};

export type PanelSliderLayoutProbe = {
  persistedDivider: boolean | undefined;
  persistedItemWidthMode: "auto" | "fixed" | undefined;
  persistedSpaceBetweenPx: number | undefined;
  persistedResponsiveItems: {
    phone: number | undefined;
    small: number | undefined;
    medium: number | undefined;
    large: number | undefined;
    xlarge: number | undefined;
  };
  persistedPanelStyle: string | undefined;
  persistedPanelSize: string | undefined;
  rootClasses: string[];
  trackClasses: string[];
  itemCount: number;
  trackMarginLeftPx: number;
  itemPaddingLeftPx: number;
  trackWidthPx: number;
  viewportWidthPx: number;
  itemWidthsPx: number[];
  dividerPseudo: {
    painted: boolean;
    borderWidthPx: number;
    insetPx: number;
  };
  panelPaddingPx: [number, number, number, number];
  panelWidthsPx: number[];
  panelHeightsPx: number[];
  overflowX: string;
  allItemsFit: boolean;
  navigationVisible: boolean;
  rootMarginTopPx: number;
  rootMarginBottomPx: number;
  rootTextAlign: string;
  itemHeightsPx: number[];
  mediaWidthPx: number;
  mediaHeightPx: number;
  mediaOffsetPx: number;
};

export type SlideshowContentCompatibilityContract = {
  schemaVersion: 1;
  id: string;
  fixture: {
    fileName: string;
    sha256: string;
    sourcePath: string;
    elementType: "slideshow";
    overlayPosition: string;
    overlayPadding: string;
    navigationType: string;
    navigationPosition: string;
    navigationMargin: string;
    navigationBreakpoint: string;
    titleElement: string;
    titleStyle: string;
    itemCount: number;
    itemsWithUrl: number;
  };
  viewport: { width: number; height: number };
  reference: {
    frameWidthPx: number;
    frameHeightPx: number;
    overlayPosition: string;
    overlayPaddingPx: [number, number, number, number];
    title: {
      tag: string;
      fontSizePx: number;
      lineHeightPx: number;
      fontWeight: number;
      color: string;
      centerOffsetYPx: number;
    };
    actionCount: number;
    slidenav: {
      widthPx: number;
      heightPx: number;
      insetPx: number;
    };
    dotnav: {
      itemCount: number;
      itemWidthPx: number;
      itemHeightPx: number;
      spacingPx: number;
      bottomInsetPx: number;
    };
  };
  tolerances: { geometryPx: number };
};

export type SlideshowContentProbe = {
  persistedOverlayPosition: string | undefined;
  persistedOverlayPadding: string | undefined;
  persistedHeadingLevel: string | undefined;
  persistedHeadingSize: string | undefined;
  frameWidthPx: number;
  frameHeightPx: number;
  rootClasses: string[];
  overlayPaddingPx: [number, number, number, number];
  titleTag: string;
  titleFontSizePx: number;
  titleLineHeightPx: number;
  titleFontWeight: number;
  titleColor: string;
  titleCenterOffsetYPx: number;
  actionCount: number;
  slidenavUsesUikit: boolean;
  slidenavWidthPx: number;
  slidenavHeightPx: number;
  slidenavInsetPx: number;
  dotnavUsesUikit: boolean;
  dotnavItemCount: number;
  dotnavItemWidthPx: number;
  dotnavItemHeightPx: number;
  dotnavSpacingPx: number;
  dotnavBottomInsetPx: number;
};

type YoothemeNode = {
  type?: unknown;
  props?: unknown;
  children?: unknown;
};

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : null;
}

function sourceNodeAtPath(source: unknown, path: string): YoothemeNode | null {
  let current: unknown = source;
  for (const segment of path.split(".").filter(Boolean)) {
    const container = asObject(current);
    if (!container) return null;
    current = container[segment];
  }
  return asObject(current) as YoothemeNode | null;
}

export function validatePanelSliderLayoutSource(
  source: unknown,
  fixtureSha256: string,
  contract: PanelSliderLayoutCompatibilityContract,
): CompatibilityReport {
  const node = sourceNodeAtPath(source, contract.fixture.sourcePath);
  const props = asObject(node?.props);
  const sourceDivider = props?.slider_divider;
  const sourceWidth = props?.slider_width;
  const sourceWidthDefault = props?.slider_width_default;
  const sourceWidthSmall = props?.slider_width_small;
  const sourceWidthMedium = props?.slider_width_medium;
  const sourceWidthLarge = props?.slider_width_large;
  const sourceWidthXLarge = props?.slider_width_xlarge;
  const sourceGap = props?.slider_gap;
  const sourceMargin = props?.margin;
  const sourceTextAlign = props?.text_align;
  const sourcePanelMatch = props?.panel_match;
  const sourcePanelStyle = props?.panel_style;
  const sourcePanelPadding = props?.panel_padding;
  const sourceImageWidth = props?.image_width;
  const checks: CompatibilityCheck[] = [
    {
      id: "fixture.sha256",
      passed: fixtureSha256 === contract.fixture.sha256,
      message: fixtureSha256 === contract.fixture.sha256
        ? `PASS: fixture hash ${fixtureSha256}`
        : `FAIL: fixture hash expected ${contract.fixture.sha256}, actual ${fixtureSha256}`,
    },
    {
      id: "source.element",
      passed: node?.type === contract.fixture.elementType,
      message: node?.type === contract.fixture.elementType
        ? `PASS: ${contract.fixture.sourcePath} is ${contract.fixture.elementType}`
        : `FAIL: expected ${contract.fixture.elementType} at ${contract.fixture.sourcePath}, actual ${String(node?.type ?? "missing")}`,
    },
    {
      id: "source.slider_divider",
      passed: sourceDivider === contract.fixture.sliderDivider,
      message: sourceDivider === contract.fixture.sliderDivider
        ? `PASS: slider_divider persisted as ${String(sourceDivider)}`
        : `FAIL: slider_divider expected ${String(contract.fixture.sliderDivider)}, actual ${String(sourceDivider)}`,
    },
    {
      id: "source.slider_width",
      passed: sourceWidth === contract.fixture.sliderWidth,
      message: sourceWidth === contract.fixture.sliderWidth
        ? `PASS: slider_width persisted as ${contract.fixture.sliderWidth || "Auto"}`
        : `FAIL: slider_width expected ${contract.fixture.sliderWidth || "Auto"}, actual ${String(sourceWidth)}`,
    },
    ...([
      ["default", sourceWidthDefault, contract.fixture.sliderWidthDefault],
      ["small", sourceWidthSmall, contract.fixture.sliderWidthSmall],
      ["medium", sourceWidthMedium, contract.fixture.sliderWidthMedium],
      ["large", sourceWidthLarge, contract.fixture.sliderWidthLarge],
      ["xlarge", sourceWidthXLarge, contract.fixture.sliderWidthXLarge],
    ] as const).map(([breakpoint, actual, expected]) => ({
      id: `source.slider_width_${breakpoint}`,
      passed: String(actual ?? "") === expected,
      message: String(actual ?? "") === expected
        ? `PASS: slider_width_${breakpoint} persisted as ${expected || "Inherit"}`
        : `FAIL: slider_width_${breakpoint} expected ${expected || "Inherit"}, actual ${String(actual ?? "") || "Inherit"}`,
    })),
    {
      id: "source.slider_gap",
      passed: sourceGap === contract.fixture.sliderGap,
      message: sourceGap === contract.fixture.sliderGap
        ? `PASS: slider_gap persisted as ${contract.fixture.sliderGap || "None"}`
        : `FAIL: slider_gap expected ${contract.fixture.sliderGap || "None"}, actual ${String(sourceGap)}`,
    },
    {
      id: "source.margin",
      passed: sourceMargin === contract.fixture.margin,
      message: sourceMargin === contract.fixture.margin
        ? `PASS: margin persisted as ${contract.fixture.margin || "None"}`
        : `FAIL: margin expected ${contract.fixture.margin || "None"}, actual ${String(sourceMargin)}`,
    },
    {
      id: "source.text_align",
      passed: sourceTextAlign === contract.fixture.textAlign,
      message: sourceTextAlign === contract.fixture.textAlign
        ? `PASS: text_align persisted as ${contract.fixture.textAlign || "left"}`
        : `FAIL: text_align expected ${contract.fixture.textAlign || "left"}, actual ${String(sourceTextAlign)}`,
    },
    {
      id: "source.panel_match",
      passed: sourcePanelMatch === contract.fixture.panelMatch,
      message: sourcePanelMatch === contract.fixture.panelMatch
        ? `PASS: panel_match persisted as ${String(contract.fixture.panelMatch)}`
        : `FAIL: panel_match expected ${String(contract.fixture.panelMatch)}, actual ${String(sourcePanelMatch)}`,
    },
    {
      id: "source.panel_style",
      passed: String(sourcePanelStyle ?? "") === contract.fixture.panelStyle,
      message: String(sourcePanelStyle ?? "") === contract.fixture.panelStyle
        ? `PASS: panel_style persisted as ${contract.fixture.panelStyle || "None"}`
        : `FAIL: panel_style expected ${contract.fixture.panelStyle || "None"}, actual ${String(sourcePanelStyle ?? "") || "None"}`,
    },
    {
      id: "source.panel_padding",
      passed: String(sourcePanelPadding ?? "") === contract.fixture.panelPadding,
      message: String(sourcePanelPadding ?? "") === contract.fixture.panelPadding
        ? `PASS: panel_padding persisted as ${contract.fixture.panelPadding || "None"}`
        : `FAIL: panel_padding expected ${contract.fixture.panelPadding || "None"}, actual ${String(sourcePanelPadding ?? "") || "None"}`,
    },
    {
      id: "source.image_width",
      passed: String(sourceImageWidth ?? "") === contract.fixture.imageWidth,
      message: String(sourceImageWidth ?? "") === contract.fixture.imageWidth
        ? `PASS: image_width persisted as ${contract.fixture.imageWidth}px`
        : `FAIL: image_width expected ${contract.fixture.imageWidth}px, actual ${String(sourceImageWidth)}`,
    },
  ];
  return report(contract.id, checks);
}

function near(actual: number, expected: number, tolerance: number): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

function dimensionsEqual(
  actual: [number, number, number, number],
  expected: [number, number, number, number],
  tolerance: number,
): boolean {
  return actual.every((value, index) => near(value, expected[index]!, tolerance));
}

function report(contractId: string, checks: CompatibilityCheck[]): CompatibilityReport {
  return {
    contractId,
    passed: checks.every((check) => check.passed),
    checks,
  };
}

function geometryCheck(
  id: string,
  label: string,
  actual: number,
  expected: number,
  tolerance: number,
): CompatibilityCheck {
  const passed = near(actual, expected, tolerance);
  return {
    id,
    passed,
    message: passed
      ? `PASS: ${label} ${actual}px (expected ${expected}px ±${tolerance})`
      : `FAIL: ${label} expected ${expected}px ±${tolerance}, actual ${actual}px`,
  };
}

/** Compare a WebPages runtime probe to a YOOtheme-derived divider contract. */
export function evaluatePanelSliderLayoutContract(
  contract: PanelSliderLayoutCompatibilityContract,
  probe: PanelSliderLayoutProbe,
): CompatibilityReport {
  const tolerance = contract.tolerances.geometryPx;
  const dividerEnabled = contract.fixture.sliderDivider;
  const checks: CompatibilityCheck[] = [
    {
      id: "persisted.slider_divider",
      passed: probe.persistedDivider === dividerEnabled,
      message: probe.persistedDivider === dividerEnabled
        ? `PASS: slider_divider persisted as ${String(dividerEnabled)}`
        : `FAIL: slider_divider expected ${String(dividerEnabled)}, actual ${String(probe.persistedDivider)}`,
    },
    {
      id: "persisted.slider_width",
      passed: probe.persistedItemWidthMode === contract.reference.persistedItemWidthMode,
      message: probe.persistedItemWidthMode === contract.reference.persistedItemWidthMode
        ? `PASS: item width mode ${probe.persistedItemWidthMode}`
        : `FAIL: item width mode expected ${contract.reference.persistedItemWidthMode}, actual ${String(probe.persistedItemWidthMode)}`,
    },
    {
      id: "persisted.slider_gap",
      passed: probe.persistedSpaceBetweenPx === contract.reference.persistedSpaceBetweenPx,
      message: probe.persistedSpaceBetweenPx === contract.reference.persistedSpaceBetweenPx
        ? `PASS: slider gap ${probe.persistedSpaceBetweenPx}px`
        : `FAIL: slider gap expected ${contract.reference.persistedSpaceBetweenPx}px, actual ${String(probe.persistedSpaceBetweenPx)}px`,
    },
    ...([
      ["phone", probe.persistedResponsiveItems.phone, contract.reference.persistedResponsiveItems.phone],
      ["small", probe.persistedResponsiveItems.small ?? null, contract.reference.persistedResponsiveItems.small],
      ["medium", probe.persistedResponsiveItems.medium ?? null, contract.reference.persistedResponsiveItems.medium],
      ["large", probe.persistedResponsiveItems.large ?? null, contract.reference.persistedResponsiveItems.large],
      ["xlarge", probe.persistedResponsiveItems.xlarge ?? null, contract.reference.persistedResponsiveItems.xlarge],
    ] as const).map(([breakpoint, actual, expected]) => ({
      id: `persisted.slider_width_${breakpoint}`,
      passed: actual === expected,
      message: actual === expected
        ? `PASS: responsive item width ${breakpoint} ${String(actual ?? "inherit")}`
        : `FAIL: responsive item width ${breakpoint} expected ${String(expected ?? "inherit")}, actual ${String(actual ?? "inherit")}`,
    })),
    {
      id: "persisted.panel_style",
      passed: probe.persistedPanelStyle === contract.reference.persistedPanelStyle,
      message: probe.persistedPanelStyle === contract.reference.persistedPanelStyle
        ? `PASS: panel style ${probe.persistedPanelStyle}`
        : `FAIL: panel style expected ${contract.reference.persistedPanelStyle}, actual ${String(probe.persistedPanelStyle)}`,
    },
    {
      id: "persisted.panel_padding",
      passed: probe.persistedPanelSize === contract.reference.persistedPanelSize,
      message: probe.persistedPanelSize === contract.reference.persistedPanelSize
        ? `PASS: panel padding semantic ${probe.persistedPanelSize}`
        : `FAIL: panel padding semantic expected ${contract.reference.persistedPanelSize}, actual ${String(probe.persistedPanelSize)}`,
    },
    {
      id: "track.required-classes",
      passed: dividerEnabled
        ? contract.reference.trackRequiredClasses.every((name) => probe.trackClasses.includes(name))
        : !probe.trackClasses.includes("uk-grid-divider"),
      message: dividerEnabled
        ? `PASS: track uses ${contract.reference.trackRequiredClasses.join(" ")}`
        : "PASS: divider semantic/class is absent",
    },
    {
      id: "items.count",
      passed: probe.itemCount === contract.reference.itemCount,
      message: probe.itemCount === contract.reference.itemCount
        ? `PASS: item count ${probe.itemCount}`
        : `FAIL: item count expected ${contract.reference.itemCount}, actual ${probe.itemCount}`,
    },
  ];

  // The recorded geometry belongs to the captured `slider_divider: true`
  // reference. The inverse probe is deliberately narrower: it protects the
  // semantic removal itself without pretending that a true-case gutter is a
  // false-case reference measurement.
  if (dividerEnabled) {
    checks.push(
      geometryCheck("track.margin-left", "track margin-left", probe.trackMarginLeftPx, contract.reference.trackMarginLeftPx, tolerance),
      geometryCheck("item.padding-left", "item padding-left", probe.itemPaddingLeftPx, contract.reference.itemPaddingLeftPx, tolerance),
      geometryCheck("slider.effective-gap", "effective slider gap", probe.itemPaddingLeftPx, contract.reference.effectiveGapPx, tolerance),
      geometryCheck(
        "track.grid-overhang",
        "track leading grid overhang",
        probe.trackWidthPx - probe.viewportWidthPx,
        contract.reference.effectiveItemGeometry.trackOverhangPx,
        tolerance,
      ),
    );
    const itemWidthsMatch = probe.itemWidthsPx.length === contract.reference.effectiveItemGeometry.itemWidthsPx.length &&
      probe.itemWidthsPx.every((width, index) => near(width, contract.reference.effectiveItemGeometry.itemWidthsPx[index]!, tolerance));
    checks.push({
      id: "items.effective-geometry",
      passed: itemWidthsMatch,
      message: itemWidthsMatch
        ? `PASS: ${contract.reference.effectiveItemGeometry.mode} item widths ${probe.itemWidthsPx.map((width) => Math.round(width)).join("/")}px`
        : `FAIL: ${contract.reference.effectiveItemGeometry.mode} item widths expected ${contract.reference.effectiveItemGeometry.itemWidthsPx.map((width) => Math.round(width)).join("/")}px ±${tolerance}, actual ${probe.itemWidthsPx.map((width) => Math.round(width)).join("/")}px`,
    });
    const itemHeightsMatch = probe.itemHeightsPx.length === contract.reference.itemHeightsPx.length &&
      probe.itemHeightsPx.every((height, index) => near(height, contract.reference.itemHeightsPx[index]!, tolerance));
    checks.push(
      geometryCheck("root.margin-top", "root margin-top", probe.rootMarginTopPx, contract.reference.rootMarginTopPx, tolerance),
      geometryCheck("root.margin-bottom", "root margin-bottom", probe.rootMarginBottomPx, contract.reference.rootMarginBottomPx, tolerance),
      {
        id: "root.text-align",
        passed: probe.rootTextAlign === contract.reference.rootTextAlign,
        message: probe.rootTextAlign === contract.reference.rootTextAlign
          ? `PASS: root text-align ${probe.rootTextAlign}`
          : `FAIL: root text-align expected ${contract.reference.rootTextAlign}, actual ${probe.rootTextAlign}`,
      },
      {
        id: "items.height",
        passed: itemHeightsMatch,
        message: itemHeightsMatch
          ? `PASS: matched item heights ${probe.itemHeightsPx.map((height) => Math.round(height)).join("/")}px`
          : `FAIL: matched item heights expected ${contract.reference.itemHeightsPx.map((height) => Math.round(height)).join("/")}px ±${tolerance}, actual ${probe.itemHeightsPx.map((height) => Math.round(height)).join("/")}px`,
      },
      geometryCheck("media.width", "media width", probe.mediaWidthPx, contract.reference.mediaWidthPx, tolerance),
      geometryCheck("media.height", "media height", probe.mediaHeightPx, contract.reference.mediaHeightPx, tolerance),
      geometryCheck(
        "alignment.media-offset",
        "center-aligned media offset",
        probe.mediaOffsetPx,
        contract.reference.textAlignmentMediaOffsetsPx.center,
        tolerance,
      ),
      {
        id: "alignment.root-class",
        passed: probe.rootClasses.includes(contract.reference.rootRequiredAlignmentClass),
        message: probe.rootClasses.includes(contract.reference.rootRequiredAlignmentClass)
          ? `PASS: root uses ${contract.reference.rootRequiredAlignmentClass}`
          : `FAIL: root expected ${contract.reference.rootRequiredAlignmentClass}, actual ${probe.rootClasses.join(" ")}`,
      },
    );
  }

  checks.push(
    {
      id: "divider.pseudo",
      passed: dividerEnabled
        ? probe.dividerPseudo.painted &&
          near(probe.dividerPseudo.borderWidthPx, contract.reference.divider.borderWidthPx, tolerance) &&
          near(probe.dividerPseudo.insetPx, contract.reference.divider.insetPx, tolerance)
        : !probe.dividerPseudo.painted && probe.dividerPseudo.borderWidthPx === 0,
      message: dividerEnabled
        ? probe.dividerPseudo.painted
          ? `PASS: divider pseudo border ${probe.dividerPseudo.borderWidthPx}px at ${probe.dividerPseudo.insetPx}px`
          : "FAIL: divider pseudo-element is not painted"
        : probe.dividerPseudo.painted
          ? "FAIL: divider pseudo-element remains painted when slider_divider is false"
          : "PASS: divider pseudo-element is absent",
    },
  );

  if (dividerEnabled) {
    checks.push(
      {
        id: "panel.padding",
        passed: dimensionsEqual(probe.panelPaddingPx, contract.reference.panelPaddingPx, tolerance),
        message: dimensionsEqual(probe.panelPaddingPx, contract.reference.panelPaddingPx, tolerance)
          ? `PASS: panel padding ${probe.panelPaddingPx.join("/")}px`
          : `FAIL: panel padding expected ${contract.reference.panelPaddingPx.join("/")}px ±${tolerance}, actual ${probe.panelPaddingPx.join("/")}px`,
      },
      {
        id: "panel.dimensions",
        passed: probe.panelWidthsPx.length === contract.reference.panelWidthsPx.length &&
          probe.panelWidthsPx.every((width, index) => near(width, contract.reference.panelWidthsPx[index]!, tolerance)) &&
          probe.panelHeightsPx.length === contract.reference.panelHeightsPx.length &&
          probe.panelHeightsPx.every((height, index) => near(height, contract.reference.panelHeightsPx[index]!, tolerance)),
        message: probe.panelWidthsPx.length === contract.reference.panelWidthsPx.length &&
          probe.panelWidthsPx.every((width, index) => near(width, contract.reference.panelWidthsPx[index]!, tolerance)) &&
          probe.panelHeightsPx.length === contract.reference.panelHeightsPx.length &&
          probe.panelHeightsPx.every((height, index) => near(height, contract.reference.panelHeightsPx[index]!, tolerance))
          ? `PASS: panel dimensions ${probe.panelWidthsPx.map((width, index) => `${Math.round(width)}×${Math.round(probe.panelHeightsPx[index] ?? 0)}`).join("/")}px`
          : `FAIL: panel dimensions expected ${contract.reference.panelWidthsPx.map((width, index) => `${Math.round(width)}×${Math.round(contract.reference.panelHeightsPx[index] ?? 0)}`).join("/")}px ±${tolerance}, actual ${probe.panelWidthsPx.map((width, index) => `${Math.round(width)}×${Math.round(probe.panelHeightsPx[index] ?? 0)}`).join("/")}px`,
      },
      {
        id: "track.overflow",
        passed: probe.overflowX === contract.reference.overflowX,
        message: probe.overflowX === contract.reference.overflowX
          ? `PASS: overflow-x ${probe.overflowX}`
          : `FAIL: overflow-x expected ${contract.reference.overflowX}, actual ${probe.overflowX}`,
      },
      {
        id: "items.fit",
        passed: probe.allItemsFit === contract.reference.allItemsFit,
        message: probe.allItemsFit === contract.reference.allItemsFit
          ? `PASS: all-items-fit is ${String(probe.allItemsFit)}`
          : `FAIL: all-items-fit expected ${String(contract.reference.allItemsFit)}, actual ${String(probe.allItemsFit)}`,
      },
      {
        id: "navigation.visibility",
        passed: probe.navigationVisible === contract.reference.navigationVisible,
        message: probe.navigationVisible === contract.reference.navigationVisible
          ? `PASS: navigation visible is ${String(probe.navigationVisible)}`
          : `FAIL: navigation visible expected ${String(contract.reference.navigationVisible)}, actual ${String(probe.navigationVisible)}`,
      },
    );
  }
  return report(contract.id, checks);
}

export function validateSlideshowContentSource(
  source: unknown,
  fixtureSha256: string,
  contract: SlideshowContentCompatibilityContract,
): CompatibilityReport {
  const node = sourceNodeAtPath(source, contract.fixture.sourcePath);
  const props = asObject(node?.props);
  const children = Array.isArray(node?.children) ? node.children : [];
  const itemsWithUrl = children.filter((child) => Boolean(asObject(asObject(child)?.props)?.link)).length;
  return report(contract.id, [
    {
      id: "fixture.sha256",
      passed: fixtureSha256 === contract.fixture.sha256,
      message: fixtureSha256 === contract.fixture.sha256
        ? `PASS: fixture hash ${fixtureSha256}`
        : `FAIL: fixture hash expected ${contract.fixture.sha256}, actual ${fixtureSha256}`,
    },
    {
      id: "source.element",
      passed: node?.type === contract.fixture.elementType,
      message: node?.type === contract.fixture.elementType
        ? `PASS: ${contract.fixture.sourcePath} is slideshow`
        : `FAIL: expected slideshow at ${contract.fixture.sourcePath}, actual ${String(node?.type ?? "missing")}`,
    },
    {
      id: "source.overlay_position",
      passed: props?.overlay_position === contract.fixture.overlayPosition,
      message: props?.overlay_position === contract.fixture.overlayPosition
        ? `PASS: overlay_position ${contract.fixture.overlayPosition}`
        : `FAIL: overlay_position expected ${contract.fixture.overlayPosition}, actual ${String(props?.overlay_position)}`,
    },
    {
      id: "source.overlay_padding",
      passed: String(props?.overlay_padding ?? "default") === contract.fixture.overlayPadding,
      message: String(props?.overlay_padding ?? "default") === contract.fixture.overlayPadding
        ? `PASS: overlay padding ${contract.fixture.overlayPadding}`
        : `FAIL: overlay padding expected ${contract.fixture.overlayPadding}, actual ${String(props?.overlay_padding ?? "default")}`,
    },
    {
      id: "source.navigation",
      passed: props?.nav === contract.fixture.navigationType,
      message: props?.nav === contract.fixture.navigationType
        ? `PASS: navigation ${contract.fixture.navigationType}`
        : `FAIL: navigation expected ${contract.fixture.navigationType}, actual ${String(props?.nav)}`,
    },
    {
      id: "source.navigation_position",
      passed: props?.nav_position === contract.fixture.navigationPosition,
      message: props?.nav_position === contract.fixture.navigationPosition
        ? `PASS: navigation position ${contract.fixture.navigationPosition}`
        : `FAIL: navigation position expected ${contract.fixture.navigationPosition}, actual ${String(props?.nav_position)}`,
    },
    {
      id: "source.navigation_margin",
      passed: props?.nav_position_margin === contract.fixture.navigationMargin,
      message: props?.nav_position_margin === contract.fixture.navigationMargin
        ? `PASS: navigation margin ${contract.fixture.navigationMargin}`
        : `FAIL: navigation margin expected ${contract.fixture.navigationMargin}, actual ${String(props?.nav_position_margin)}`,
    },
    {
      id: "source.navigation_breakpoint",
      passed: props?.nav_breakpoint === "s" && contract.fixture.navigationBreakpoint === "small",
      message: props?.nav_breakpoint === "s" && contract.fixture.navigationBreakpoint === "small"
        ? "PASS: navigation breakpoint small"
        : `FAIL: navigation breakpoint expected small/s, actual ${String(props?.nav_breakpoint)}`,
    },
    {
      id: "source.title_element",
      passed: String(props?.title_element ?? "h3") === contract.fixture.titleElement,
      message: String(props?.title_element ?? "h3") === contract.fixture.titleElement
        ? `PASS: title element ${contract.fixture.titleElement}`
        : `FAIL: title element expected ${contract.fixture.titleElement}, actual ${String(props?.title_element ?? "h3")}`,
    },
    {
      id: "source.items",
      passed: children.length === contract.fixture.itemCount && itemsWithUrl === contract.fixture.itemsWithUrl,
      message: children.length === contract.fixture.itemCount && itemsWithUrl === contract.fixture.itemsWithUrl
        ? `PASS: ${children.length} items, ${itemsWithUrl} with URLs`
        : `FAIL: expected ${contract.fixture.itemCount} items/${contract.fixture.itemsWithUrl} URLs, actual ${children.length}/${itemsWithUrl}`,
    },
  ]);
}

export function evaluateSlideshowContentContract(
  contract: SlideshowContentCompatibilityContract,
  probe: SlideshowContentProbe,
): CompatibilityReport {
  const tolerance = contract.tolerances.geometryPx;
  const expectedClass = `shop-builder-slideshow-overlay--${contract.reference.overlayPosition}`;
  const colorChannels = probe.titleColor.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number) ?? [];
  const expectedTitleChannels = contract.reference.title.color
    .match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number) ?? [];
  const titleColorMatchesGlobalContext = colorChannels.length === 3 &&
    expectedTitleChannels.length === 3 &&
    colorChannels.every((channel, index) => Math.abs(channel - expectedTitleChannels[index]!) <= 1);
  return report(contract.id, [
    {
      id: "persisted.overlay_position",
      passed: probe.persistedOverlayPosition === contract.reference.overlayPosition,
      message: probe.persistedOverlayPosition === contract.reference.overlayPosition
        ? `PASS: overlay position ${probe.persistedOverlayPosition}`
        : `FAIL: overlay position expected ${contract.reference.overlayPosition}, actual ${String(probe.persistedOverlayPosition)}`,
    },
    {
      id: "persisted.overlay_padding",
      passed: probe.persistedOverlayPadding === contract.fixture.overlayPadding,
      message: probe.persistedOverlayPadding === contract.fixture.overlayPadding
        ? `PASS: overlay padding ${probe.persistedOverlayPadding}`
        : `FAIL: overlay padding expected ${contract.fixture.overlayPadding}, actual ${String(probe.persistedOverlayPadding)}`,
    },
    {
      id: "persisted.title_element",
      passed: probe.persistedHeadingLevel === contract.fixture.titleElement,
      message: probe.persistedHeadingLevel === contract.fixture.titleElement
        ? `PASS: title element ${probe.persistedHeadingLevel}`
        : `FAIL: title element expected ${contract.fixture.titleElement}, actual ${String(probe.persistedHeadingLevel)}`,
    },
    {
      id: "overlay.position-class",
      passed: probe.rootClasses.includes(expectedClass),
      message: probe.rootClasses.includes(expectedClass)
        ? `PASS: overlay uses ${expectedClass}`
        : `FAIL: overlay expected ${expectedClass}, actual ${probe.rootClasses.join(" ")}`,
    },
    {
      id: "overlay.padding",
      passed: dimensionsEqual(probe.overlayPaddingPx, contract.reference.overlayPaddingPx, tolerance),
      message: dimensionsEqual(probe.overlayPaddingPx, contract.reference.overlayPaddingPx, tolerance)
        ? `PASS: overlay padding ${probe.overlayPaddingPx.join("/")}px`
        : `FAIL: overlay padding expected ${contract.reference.overlayPaddingPx.join("/")}px ±${tolerance}, actual ${probe.overlayPaddingPx.join("/")}px`,
    },
    {
      id: "title.element",
      passed: probe.titleTag === contract.reference.title.tag,
      message: probe.titleTag === contract.reference.title.tag
        ? `PASS: rendered title ${probe.titleTag}`
        : `FAIL: rendered title expected ${contract.reference.title.tag}, actual ${probe.titleTag}`,
    },
    geometryCheck("title.font-size", "title font size", probe.titleFontSizePx, contract.reference.title.fontSizePx, tolerance),
    geometryCheck("title.line-height", "title line height", probe.titleLineHeightPx, contract.reference.title.lineHeightPx, tolerance),
    {
      id: "title.font-weight",
      passed: probe.titleFontWeight === contract.reference.title.fontWeight,
      message: probe.titleFontWeight === contract.reference.title.fontWeight
        ? `PASS: title font weight ${probe.titleFontWeight}`
        : `FAIL: title font weight expected ${contract.reference.title.fontWeight}, actual ${probe.titleFontWeight}`,
    },
    {
      id: "title.color",
      // A source item with no explicit text_color inherits Global Typography's
      // emphasis token. A component-only "dark" class would be a parallel,
      // and incorrect, ownership path.
      passed: titleColorMatchesGlobalContext,
      message: titleColorMatchesGlobalContext
        ? `PASS: title inherits Global emphasis color ${probe.titleColor}`
        : `FAIL: title expected dark semantic context (DevStack ${contract.reference.title.color}), actual ${probe.titleColor}`,
    },
    geometryCheck("title.vertical-position", "title center offset", probe.titleCenterOffsetYPx, contract.reference.title.centerOffsetYPx, tolerance),
    {
      id: "actions.count",
      passed: probe.actionCount === contract.reference.actionCount,
      message: probe.actionCount === contract.reference.actionCount
        ? `PASS: action count ${probe.actionCount}`
        : `FAIL: action count expected ${contract.reference.actionCount}, actual ${probe.actionCount}`,
    },
    {
      id: "slidenav.uikit",
      passed: probe.slidenavUsesUikit,
      message: probe.slidenavUsesUikit
        ? "PASS: slidenav uses UIkit classes"
        : "FAIL: slidenav is missing UIkit classes",
    },
    geometryCheck("slidenav.width", "slidenav width", probe.slidenavWidthPx, contract.reference.slidenav.widthPx, tolerance),
    geometryCheck("slidenav.height", "slidenav height", probe.slidenavHeightPx, contract.reference.slidenav.heightPx, tolerance),
    geometryCheck("slidenav.inset", "slidenav frame inset", probe.slidenavInsetPx, contract.reference.slidenav.insetPx, tolerance),
    {
      id: "dotnav.uikit",
      passed: probe.dotnavUsesUikit,
      message: probe.dotnavUsesUikit
        ? "PASS: dotnav uses UIkit classes and item structure"
        : "FAIL: dotnav is missing UIkit classes/item structure",
    },
    {
      id: "dotnav.count",
      passed: probe.dotnavItemCount === contract.reference.dotnav.itemCount,
      message: probe.dotnavItemCount === contract.reference.dotnav.itemCount
        ? `PASS: dotnav item count ${probe.dotnavItemCount}`
        : `FAIL: dotnav item count expected ${contract.reference.dotnav.itemCount}, actual ${probe.dotnavItemCount}`,
    },
    geometryCheck("dotnav.width", "dotnav item width", probe.dotnavItemWidthPx, contract.reference.dotnav.itemWidthPx, tolerance),
    geometryCheck("dotnav.height", "dotnav item height", probe.dotnavItemHeightPx, contract.reference.dotnav.itemHeightPx, tolerance),
    geometryCheck("dotnav.spacing", "dotnav spacing", probe.dotnavSpacingPx, contract.reference.dotnav.spacingPx, tolerance),
    geometryCheck("dotnav.bottom-inset", "dotnav frame bottom inset", probe.dotnavBottomInsetPx, contract.reference.dotnav.bottomInsetPx, tolerance),
  ]);
}

export function formatCompatibilityReport(reportValue: CompatibilityReport): string {
  return [`YOOtheme compatibility: ${reportValue.contractId}`, ...reportValue.checks.map((check) => check.message)].join("\n");
}
