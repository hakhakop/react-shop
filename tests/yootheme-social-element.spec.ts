import { expect, test } from "@playwright/test";
import type { BuilderLayout } from "@/lib/builderLayouts";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { inferSocialIcon, socialLinkLabel } from "@/lib/socialIcons";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

const source = {
  type: "layout",
  children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
    type: "social",
    props: {
      link_style: "button",
      grid: "vertical",
      grid_breakpoint: "m",
      grid_column_gap: "none",
      grid_row_gap: "large",
      icon_width: 28,
      image_width: 32,
      image_height: 24,
      image_loading: "eager",
      image_svg_inline: true,
      link_target: "blank",
      link_aria_label: "Social profile",
    },
    children: [
      { type: "social_item", props: { link: "https://instagram.com/woolberry", link_aria_label: "Woolberry on Instagram" } },
      { type: "social_item", props: { link: "mailto:hello@example.test", icon: "mail", image: "/uploads/mail.svg" } },
    ],
  }] }] }] }],
};

test("imports the audited YOOtheme Social item and settings contract", () => {
  const result = mapYoothemeStaticContent(source);
  const social = result.sections[0]?.layoutItems?.[0]?.blocks?.[0];
  expect(social).toMatchObject({
    kind: "social",
    socialStyle: "button",
    socialGrid: "vertical",
    socialGridBreakpoint: "medium",
    socialColumnGap: "none",
    socialRowGap: "large",
    socialIconWidth: 28,
    socialImageWidth: 32,
    socialImageHeight: 24,
    socialImageLoading: "eager",
    socialImageSvgInline: true,
    socialLinkTarget: "_blank",
    socialLinkAriaLabel: "Social profile",
  });
  expect(social?.socialItems).toEqual([
    expect.objectContaining({ link: "https://instagram.com/woolberry", linkAriaLabel: "Woolberry on Instagram" }),
    expect.objectContaining({ link: "mailto:hello@example.test", iconName: "mail", imageUrl: "/uploads/mail.svg" }),
  ]);
  expect(result.warnings).toEqual([]);
});

test("materializes a dynamic Social item collection without mutating the authored document", async () => {
  const mapped = mapYoothemeStaticContent({
    ...source,
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "social",
      children: [{
        type: "social_item",
        props: { link: "https://example.test/fallback" },
        source: {
          query: { name: "profiles.customProfiles", arguments: { limit: 2 } },
          props: {
            link: { name: "field.social_url" },
            link_aria_label: { name: "field.social_label" },
          },
        },
      }],
    }] }] }] }],
  });
  const authored: BuilderLayout = { version: 1, key: "page:social-proof", page: "page:social-proof", updatedAt: "2026-09-03T00:00:00.000Z", sections: mapped.sections };
  expect(authored.sections[0]?.rows?.[0]?.columns[0]?.elements[0]?.socialItems?.[0]?.dynamicBindings).toEqual({
    link: { path: "acf.social_url", valueType: "url" },
    linkAriaLabel: { path: "acf.social_label", valueType: "string" },
  });
  const snapshot = JSON.stringify(authored);
  const result = await materializeBuilderDynamicContent(authored, { resolveContexts: async () => [1, 2].map((id) => ({
    id: `profile-${id}`,
    fields: {
      "acf.social_url": { type: "url" as const, value: `https://social.example/profile-${id}` },
      "acf.social_label": { type: "string" as const, value: `Profile ${id}` },
    },
  })) });
  const items = result.renderLayout.sections[0]?.rows?.[0]?.columns[0]?.elements[0]?.socialItems ?? [];
  expect(items.map((item) => item.link)).toEqual(["https://social.example/profile-1", "https://social.example/profile-2"]);
  expect(items.map((item) => item.linkAriaLabel)).toEqual(["Profile 1", "Profile 2"]);
  expect(items.every((item) => !item.dynamicContext && !item.dynamicBindings)).toBe(true);
  expect(JSON.stringify(authored)).toBe(snapshot);
});

test("infers audited URL brands and accessible fallback labels", () => {
  expect(inferSocialIcon("https://facebook.com/woolberry")).toBe("facebook");
  expect(inferSocialIcon("https://x.com/woolberry")).toBe("twitter");
  expect(inferSocialIcon("tel:+123456789")).toBe("phone");
  expect(socialLinkLabel("https://discord.gg/example")).toBe("Discord");
});
