import { test, expect } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { resolveWordPressMediaUrl } from "@/lib/builderMediaUrls";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";
import { decodeHtmlEntities, sanitizeHtml } from "@/lib/safeHtml";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";

test("maps YOOtheme Overlay Image into the canonical image block", () => {
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
              image: "wp-content/uploads/yootheme/overlay.jpg",
              image_alt: "Overlay image",
              image_width: 600,
              image_height: 430,
              image_hover: "wp-content/uploads/yootheme/overlay-hover.jpg",
              image_loading: true,
              title: "Little Paradise",
              meta: "Travel Report",
              content: "<p>Story copy</p>",
              link: "?page_id=23",
              link_text: "Read story",
              overlay_mode: "cover",
              overlay_link: true,
              overlay_style: "overlay-primary",
              overlay_position: "center",
              overlay_hover: true,
              overlay_transition: "fade",
              overlay_padding: "default",
              overlay_margin: "none",
              text_color: "light",
              text_color_hover: true,
              overlay_blend: true,
              title_style: "heading-h3",
              title_element: "h3",
              title_transition: "slide-bottom-small",
              title_font_family: "primary",
              title_color: "emphasis",
              title_decoration: "divider",
              meta_font_family: "secondary",
              meta_style: "text-meta",
              meta_color: "muted",
              meta_element: "div",
              meta_align: "below-title",
              meta_transition: "slide-bottom-small",
              content_font_family: "tertiary",
            },
          }],
        }],
      }],
    }],
  });

  const block = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0];
  expect(block?.kind).toBe("overlay");
  expect(block?.imageUrl).toBe("/wp-content/uploads/yootheme/overlay.jpg");
  expect(block?.hoverImageUrl).toBe("/wp-content/uploads/yootheme/overlay-hover.jpg");
  expect(block?.overlayStyle).toBe("overlay-primary");
  expect(block?.linkOverlay).toBe(true);
  expect(block?.overlayHover).toBe(true);
  expect(block?.title).toBe("Little Paradise");
  expect(block?.meta).toBe("Travel Report");
  expect(block?.linkText).toBe("Read story");
  expect(block?.imageIntrinsicWidth).toBe(600);
  expect(block?.imageIntrinsicHeight).toBe(430);
  expect(block?.imageHeight).toBeUndefined();
  expect(block?.imageFit).toBe("cover");
  expect(block?.overlayPadding).toBe("default");
  expect(block?.overlayMargin).toBe("none");
  expect(block?.overlayTextColor).toBe("light");
  expect(block?.overlayTextColorHover).toBe(true);
  expect(block?.overlayBlendImage).toBe(true);
  expect(block?.titleElement).toBe("h3");
  expect(block?.titleTypographyRole).toBe("primary");
  expect(block?.titleColor).toBe("emphasis");
  expect(block?.titleDecoration).toBe("divider");
  expect(block?.titleTransition).toBe("slide-bottom-small");
  expect(block?.metaTypographyRole).toBe("secondary");
  expect(block?.metaColor).toBe("muted");
  expect(block?.metaElement).toBe("div");
  expect(block?.metaAlignment).toBe("below-title");
  expect(block?.metaTransition).toBe("slide-bottom-small");
  expect(block?.contentTypographyRole).toBe("tertiary");
});

test("resolves imported YOOtheme typography through the tenant global tokens", () => {
  const vars = getUikitGlobalsCssVars({
    fontFamilyBody: "Poppins",
    fontFamilyHeading: "inherit",
    fontFamilyPrimary: "Poppins",
    fontWeightPrimary: "normal",
    baseFontSize: "16px",
    fontSizeSmall: "13px",
    fontSizeMedium: "22px",
    fontSizeLarge: "28px",
    fontSizeXLarge: "40px",
    fontSize2XLarge: "46px",
    headingMediumFontSizeResponsive: "64px",
    navbarNavItemTextTransform: "uppercase",
  });

  expect(vars).toMatchObject({
    "--uk-global-font-family": '"Poppins", system-ui, sans-serif',
    "--uk-heading-font-weight": "normal",
    "--uk-heading-h1-font-size": "46px",
    "--uk-heading-h3-font-size": "28px",
    "--uk-heading-h5-font-size": "16px",
    "--uk-heading-h6-font-size": "13px",
    "--uk-heading-small-font-size": "calc(calc(64px * 0.8125) * 0.8)",
    "--uk-heading-medium-font-size-m": "calc(64px * 0.875)",
    "--uk-heading-medium-font-size-responsive": "64px",
    "--uk-text-small-font-size": "13px",
    "--uk-text-large-font-size": "28px",
    "--uk-navbar-nav-item-text-transform": "uppercase",
  });
});

test("decodes YOOtheme soft-hyphen entities without exposing the entity text", () => {
  const sanitized = sanitizeHtml("<p>photogra&shy;pher &#173; &#xAD; &amp;shy; &amp;#173; &amp; director</p>");
  expect(sanitized).toContain("photogra\u00adpher");
  expect(sanitized).toContain("\u00ad \u00ad \u00ad \u00ad &amp; director");
  expect(sanitized).not.toContain("&amp;shy;");
  expect(sanitized).not.toContain("&amp;#173;");
  expect(sanitized).not.toContain("&amp;#xAD;");
});

test("decodes visible YOOtheme text entities at the canonical import boundary", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "overlay",
      props: {
        title: "Alice &amp; George",
        meta: "Wedding &amp;amp; Portrait",
        link_text: "Read &amp; story",
      },
    }] }] }] }],
  });
  const block = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0];
  expect(block?.title).toBe("Alice & George");
  expect(block?.meta).toBe("Wedding & Portrait");
  expect(block?.linkText).toBe("Read & story");
  expect(decodeHtmlEntities("Chloé &amp; Marc")).toBe("Chloé & Marc");
});

test("keeps a hover-only YOOtheme Overlay empty until pointer interaction", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "overlay",
      props: {
        hover_image: "wp-content/uploads/yootheme/home-hire-me-bg.jpg",
        image_width: "2560",
        image_height: "900",
        image_min_height: "650",
        link: "mailto:hello@example.com",
        overlay_mode: "cover",
        overlay_hover: false,
        overlay_link: true,
        overlay_position: "center",
        overlay_transition: "fade",
        title: "Ready to start a project?",
        title_element: "h2",
        title_style: "heading-medium",
        meta: "Drop me a line",
        meta_align: "below-title",
        meta_element: "div",
        meta_style: "h5",
      },
    }] }] }] }],
  });

  const block = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0];
  expect(block?.kind).toBe("overlay");
  expect(block?.imageUrl).toBe("");
  expect(block?.hoverImageUrl).toBe("/wp-content/uploads/yootheme/home-hire-me-bg.jpg");
  expect(block?.imageIntrinsicWidth).toBe(2560);
  expect(block?.imageIntrinsicHeight).toBe(900);
  expect(block?.imageMinHeight).toBe("650px");
  expect(block?.imageHeight).toBeUndefined();
  expect(block?.imageFit).toBe("cover");
  expect(block?.overlayHover).toBe(false);
  expect(block?.linkOverlay).toBe(true);
  expect(block?.title).toBe("Ready to start a project?");
  expect(block?.titleElement).toBe("h2");
  expect(block?.meta).toBe("Drop me a line");
  expect(block?.metaAlignment).toBe("below-title");
});

test("recognizes the standalone YOOtheme overlay node", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "overlay",
      props: { image: "/overlay.jpg", title: "Overlay", overlay_mode: "cover", overlay_style: "overlay-primary" },
    }] }] }] }],
  });
  const block = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0];
  expect(block?.kind).toBe("overlay");
  expect(block?.overlayStyle).toBe("overlay-primary");
  expect(mapped.warnings).toEqual([]);
});

test("rewrites imported WordPress media to the active tenant CMS origin", () => {
  expect(resolveWordPressMediaUrl(
    "https://circle.webpages.am/wp-content/uploads/yootheme/overlay.jpg",
    "https://jack.webpages.am",
  )).toBe("https://jack.webpages.am/wp-content/uploads/yootheme/overlay.jpg");
  expect(resolveWordPressMediaUrl(
    "/wp-content/uploads/yootheme/overlay.jpg",
    "https://jack.webpages.am",
  )).toBe("https://jack.webpages.am/wp-content/uploads/yootheme/overlay.jpg");
});

test("keeps YOOtheme responsive heading and navbar typography in the shell contract", () => {
  const mapped = resolveYoothemeLess([{
    name: "master-jack-baker/_import.less",
    precedence: 1,
    content: [
      "@global-font-size: 16px;",
      "@heading-small-font-size-m: 50px;",
      "@heading-large-font-size-l: 86px;",
      "@heading-xlarge-font-size-l: 130px;",
      "@heading-2xlarge-font-size-l: 168px;",
      "@navbar-nav-item-text-transform: uppercase;",
    ].join(" "),
  }]);

  expect(mapped.shellSettings).toMatchObject({
    headingSmallFontSizeResponsive: "50px",
    headingLargeFontSizeResponsive: "86px",
    headingXLargeFontSizeResponsive: "130px",
    heading2XLargeFontSizeResponsive: "168px",
    navbarNavItemTextTransform: "uppercase",
  });
});
