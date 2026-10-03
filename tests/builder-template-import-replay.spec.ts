import { expect, test } from "@playwright/test";
import type { BuilderSavedTemplate } from "@/components/dashboard/builderTypes";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { resolveSavedTemplateForApply } from "@/lib/builderTemplateImportReplay";

const yoothemeSource = {
  type: "layout",
  children: [{
    type: "section",
    props: { width: "large", width_expand: "right" },
    children: [{ type: "row", children: [{ type: "column", children: [] }] }],
  }],
};

test("YOOtheme Library migrations repair known fields without replacing saved composition data", () => {
  const staleSections = mapYoothemeStaticContent({
    ...yoothemeSource,
    children: [{
      ...yoothemeSource.children[0],
      props: { width: "large" },
    }],
  }).sections;
  staleSections[0].title = "Preserved saved title";
  const template = {
    id: "saved-yootheme-layout",
    title: "Saved layout",
    templateType: "section",
    sourceImport: {
      format: "yootheme-json",
      version: 1,
      payload: yoothemeSource,
    },
    sections: staleSections,
    updatedAt: "2026-10-02T00:00:00.000Z",
  } as BuilderSavedTemplate;

  expect(template.sections[0].expandOneSide).not.toBe("right");
  const migrated = resolveSavedTemplateForApply(template);
  expect(migrated.sections[0].expandOneSide).toBe("right");
  expect(migrated.sections[0].title).toBe("Preserved saved title");
  expect(template.sections[0].expandOneSide).not.toBe("right");
});

test("Builder-native Library items remain saved snapshots", () => {
  const template = {
    id: "native-layout",
    title: "Native layout",
    templateType: "section",
    sections: [],
    updatedAt: "2026-10-02T00:00:00.000Z",
  } as BuilderSavedTemplate;

  expect(resolveSavedTemplateForApply(template)).toBe(template);
});

test("portable Builder JSON Library items reapply the preserved source snapshot", () => {
  const sourceSection = mapYoothemeStaticContent(yoothemeSource).sections[0];
  const template = {
    id: "portable-layout",
    title: "Portable layout",
    templateType: "section",
    sourceImport: {
      format: "webpages-builder-json",
      version: 1,
      payload: { template: { sections: [sourceSection] } },
    },
    sections: [],
    updatedAt: "2026-10-02T00:00:00.000Z",
  } as BuilderSavedTemplate;

  expect(resolveSavedTemplateForApply(template).sections[0]).toMatchObject({
    maxWidth: "large",
    expandOneSide: "right",
  });
});
