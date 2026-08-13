import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  analyzeYoothemeLayout,
  analyzeYoothemeGlobalStyleBoundary,
  mapYoothemeStaticContent,
  mapYoothemeStructure,
  resolveYoothemeAssetUrl,
} from "../lib/yoothemePageImport.ts";

const fixturePath = "/Users/hakobjaghatspanyan/Downloads/Home.json";

const loadFixture = async () =>
  JSON.parse(await readFile(fixturePath, "utf8"));

test("Home.json analyzer reports the expected source vocabulary", async () => {
  const analysis = analyzeYoothemeLayout(await loadFixture());

  assert.equal(analysis.rootType, "layout");
  assert.equal(analysis.sourceVersion, "4.5.18");
  assert.equal(analysis.nodeCounts.section, 7);
  assert.equal(analysis.nodeCounts.row, 13);
  assert.equal(analysis.nodeCounts.column, 16);
  assert.equal(analysis.nodeCounts.headline, 7);
  assert.equal(analysis.nodeCounts.text, 4);
  assert.equal(analysis.nodeCounts.button, 3);
  assert.equal(analysis.nodeCounts.image, 14);
  assert.equal(analysis.nodeCounts.grid, 4);
  assert.equal(analysis.nodeCounts.panel, 3);
  assert.equal(analysis.nodeCounts["overlay-slider"], 1);
  assert.deepEqual(analysis.unsupportedTypes, []);
});

test("Home.json structure maps deterministically to WebPages primitives", async () => {
  const mapping = mapYoothemeStructure(await loadFixture());

  assert.equal(mapping.sections.length, 7);
  assert.equal(mapping.warnings.length, 0);
  assert.equal(mapping.sections[0].layoutRows, 2);
  assert.equal(mapping.sections[0].layoutItems.length, 2);
  assert.equal(mapping.sections[0].layoutItems[0].rowLayout, "1-col");
  assert.equal(mapping.sections[1].layoutRows, 1);
  assert.equal(mapping.sections[1].layoutItems.length, 1);
  assert.equal(mapping.sections[1].layoutItems[0].rowLayout, "1-col");
  assert.equal(mapping.sections[2].layoutItems[0].rowLayout, "1-col");
  assert.equal(mapping.sections[2].layoutItems[1].rowLayout, "3-col-equal");
  assert.equal(mapping.sections[2].layoutItems.length, 4);
  assert.deepEqual(
    mapping.sections.map((section) => section.id),
    [
      "yootheme-section-1",
      "yootheme-section-2",
      "yootheme-section-3",
      "yootheme-section-4",
      "yootheme-section-5",
      "yootheme-section-6",
      "yootheme-section-7",
    ],
  );
});

test("unsupported structural input is reported without guessing", () => {
  const mapping = mapYoothemeStructure({
    type: "layout",
    children: [
      {
        type: "section",
        children: [
          {
            type: "row",
            children: Array.from({ length: 7 }, () => ({ type: "column" })),
          },
        ],
      },
    ],
  });

  assert.equal(mapping.sections.length, 1);
  assert.equal(mapping.sections[0].layoutItems.length, 7);
  assert.equal(mapping.sections[0].layoutItems[0].rowLayout, "1-col");
  assert.match(mapping.warnings[0], /7 columns/);
});

test("Home.json static content maps to existing WebPages block fields", async () => {
  const mapping = mapYoothemeStaticContent(await loadFixture());
  const firstColumn = mapping.sections[0].layoutItems[0];

  assert.equal(mapping.sections.length, 7);
  assert.equal(mapping.sections[0].visible, true);
  assert.equal(mapping.sections[0].sectionVariant, "default");
  assert.equal(mapping.sections[0].backgroundRole, "default");
  assert.equal(mapping.sections[0].topSpacing, "large");
  assert.equal(mapping.sections[0].bottomSpacing, "none");
  assert.equal(mapping.sections[6].sectionVariant, "muted");
  assert.equal(mapping.sections[6].backgroundRole, "muted");
  assert.deepEqual(
    firstColumn.blocks.slice(0, 3).map((block) => block.kind),
    ["heading", "text", "button"],
  );

  const heading = firstColumn.blocks[0];
  assert.equal(heading.headingText, 'Build Anything on<br class="uk-visible@s"> DevStack');
  assert.equal(heading.headingLevel, "h1");
  assert.equal(heading.headingSize, "medium");
  assert.equal(heading.headingAlign, "center");

  const text = firstColumn.blocks[1];
  assert.equal(text.textVariant, "lead");
  assert.equal(text.textAlign, "center");

  const button = firstColumn.blocks[2];
  assert.equal(button.buttons.length, 2);
  assert.equal(button.buttons[0].label, "Sign up for Free");
  assert.equal(button.buttons[0].url, "?page_id=21");
  assert.equal(button.buttons[1].style, "outline");

  const heroImage = mapping.sections[0].layoutItems[1].blocks[0];
  assert.equal(heroImage.kind, "image");
  assert.equal(heroImage.imageUrl, "/wp-content/uploads/yootheme/home-hero.jpg");
  assert.equal(heroImage.imageShape, "rounded");
  assert.equal(heroImage.imageMaxWidth, 750);
  assert.equal(heroImage.imageLinkTarget, "_self");

  const heroImageLayout = heroImage.visualStyle?.layout;
  assert.deepEqual(heroImageLayout, {
    position: "relative",
    zIndex: 1,
  });

  const playOverlay = mapping.sections[0].layoutItems[1].blocks[1];
  assert.equal(playOverlay.imageUrl, "/wp-content/uploads/yootheme/icon-play.svg");
  assert.equal(playOverlay.imageMaxWidth, 100);
  assert.deepEqual(playOverlay.visualStyle?.layout, {
    position: "absolute",
    top: "50%",
    zIndex: 2,
  });
  assert.equal(playOverlay.visualStyle?.customClass, "uk-disabled");
  assert.match(playOverlay.visualStyle?.customCss ?? "", /\.el-image/);
  assert.match(playOverlay.visualStyle?.customCss ?? "", /@keyframes pulse/);

  const positionedBackground = mapping.sections[0].layoutItems[0].blocks[3];
  assert.equal(positionedBackground.kind, "image");
  assert.deepEqual(positionedBackground.visualStyle?.layout, {
    position: "absolute",
    top: "22vh",
    left: "-20vw",
    zIndex: 0,
  });

  const relativeHeading = mapping.sections[3].layoutItems[0].blocks[0];
  assert.deepEqual(relativeHeading.visualStyle?.layout, {
    position: "relative",
    zIndex: 1,
  });

  const importedBlocks = mapping.sections.flatMap((section) =>
    section.layoutItems.flatMap((item) => item.blocks),
  );
  const grids = importedBlocks.filter((block) => block.kind === "grid");
  assert.equal(grids.length, 4);
  assert.equal(grids[1].gridItems.length, 8);
  assert.equal(grids[1].gridItems[0].title, "Easy Deployments");
  assert.equal(grids[1].gridItemRenderer, "card");

  const panel = importedBlocks.find(
    (block) => block.kind === "panel" && block.title === "Integrate",
  );
  assert.ok(panel);
  assert.equal(panel.panelShowMedia, true);

  const panelSlider = importedBlocks.find(
    (block) => block.kind === "panelSlider",
  );
  assert.ok(panelSlider);
  assert.equal(panelSlider.carouselSettings.variant, "panel");
  assert.equal(panelSlider.slides.length, 1);

  assert.ok(mapping.warnings.some((warning) => warning.includes("modal image links")));
  assert.ok(mapping.warnings.some((warning) => warning.includes("INTENTIONALLY UNSUPPORTED for Compatibility Fixture #1")));
});

test("Home.json global-style boundary maps existing semantics and reports concrete values", async () => {
  const boundary = analyzeYoothemeGlobalStyleBoundary(await loadFixture());

  assert.equal(boundary.hasSourceGlobalSettings, false);
  assert.ok(boundary.mapped.some((value) => value.sourceKey === "style" && value.owner === "UIkit token"));
  assert.ok(boundary.mapped.some((value) => value.sourceKey === "padding" && value.owner === "WebPages Global Styles"));
  assert.ok(boundary.mapped.some((value) => value.sourceKey === "title_style"));
  assert.ok(boundary.mapped.some((value) => value.sourceKey === "text_style"));
  assert.ok(boundary.mapped.some((value) => value.sourceKey === "panel_style"));

  const concrete = analyzeYoothemeGlobalStyleBoundary({
    type: "layout",
    children: [{ type: "headline", props: { font_family: "Manrope", color: "#111111" } }],
  });
  assert.equal(concrete.hasSourceGlobalSettings, false);
  assert.deepEqual(
    concrete.unmapped.map(({ sourceKey, sourceValue }) => [sourceKey, sourceValue]),
    [["font_family", "Manrope"], ["color", "#111111"]],
  );
});

test("YOOtheme page global background payload maps to the canonical four roles", () => {
  const mapping = mapYoothemeStaticContent({
    type: "layout",
    global: {
      global_background: "#ffffff",
      global_muted_background: "#eff2f8",
      global_primary_background: "#643cf4",
      global_secondary_background: "#17104e",
    },
    children: [{ type: "section", props: { style: "primary" }, children: [] }],
  });

  assert.deepEqual(mapping.globalStylePatch, {
    backgroundDefault: "#ffffff",
    backgroundMuted: "#eff2f8",
    backgroundPrimary: "#643cf4",
    backgroundSecondary: "#17104e",
  });
  assert.equal(mapping.sections[0].backgroundRole, "primary");
});

test("YOOtheme asset paths can resolve against the configured WordPress site", () => {
  assert.equal(
    resolveYoothemeAssetUrl(
      "/wp-content/uploads/yootheme/background-square-02.png",
      "https://cms.webpages.am",
    ),
    "https://cms.webpages.am/wp-content/uploads/yootheme/background-square-02.png",
  );
  assert.equal(
    resolveYoothemeAssetUrl("https://cdn.example.com/image.jpg", "https://cms.webpages.am"),
    "https://cdn.example.com/image.jpg",
  );
});

test("YOOtheme Grid image and responsive settings map to the canonical Grid contract", () => {
  const mapping = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{
          type: "column",
          children: [{
            type: "grid",
            props: {
              grid_default: "1",
              grid_small: "2",
              grid_medium: "3",
              grid_column_gap: "large",
              grid_row_gap: "small",
              grid_divider: true,
              grid_column_align: true,
              grid_row_align: false,
              image_width: "68",
              image_height: "auto",
              image_loading: true,
              image_border: "rounded",
              image_box_shadow: "small",
              image_box_decoration: "primary",
              image_transition: "scale-up",
              link_image: true,
            },
            children: [],
          }],
        }],
      }],
    }],
  });

  const grid = mapping.sections[0].layoutItems[0].blocks[0];
  assert.equal(grid.columnsPhonePortrait, "1");
  assert.equal(grid.columnsPhoneLandscape, "2");
  assert.equal(grid.columnsTabletLandscape, "3");
  assert.equal(grid.gridGap, "large");
  assert.equal(grid.gridRowGap, "small");
  assert.equal(grid.showDividers, true);
  assert.equal(grid.centerColumns, true);
  assert.equal(grid.centerRows, false);
  assert.equal(grid.gridMediaWidth, "large");
  assert.equal(grid.imageMaxWidth, 68);
  assert.equal(grid.imageLoading, "eager");
  assert.equal(grid.imageBorder, "rounded");
  assert.equal(grid.imageBoxShadow, "small");
  assert.equal(grid.imageBoxDecoration, "primary");
  assert.equal(grid.imageHoverTransition, "scale-up");
  assert.equal(grid.linkImage, true);
});

test("unsupported nodes remain visible as recoverable import warnings", () => {
  const mapping = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{
          type: "column",
          children: [
            { type: "form", props: { provider: "external" } },
            { type: "image", props: { image: null, alt: "Missing image" } },
          ],
        }],
      }],
    }],
  });

  assert.equal(mapping.sections[0].layoutItems[0].blocks.length, 1);
  assert.ok(mapping.warnings.some((warning) => warning.includes("source node 'form' is unsupported")));
  assert.ok(mapping.warnings.some((warning) => warning.includes("image asset could not be resolved")));
});
