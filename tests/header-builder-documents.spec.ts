import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type {
  BuilderSection,
  BuilderState,
} from "@/components/dashboard/builderTypes";
import { defaultBuilderShellSettings } from "@/lib/builderShell";
import {
  readBuilderLayoutStore,
  writeBuilderLayoutStore,
  type BuilderLayout,
} from "@/lib/builderLayouts";
import {
  ensureHeaderBuilderDocuments,
  getHeaderBuilderDocuments,
  reconcileHeaderSectionRows,
} from "@/lib/headerBuilderDocument";
import {
  HEADER_BUILDER_DOCUMENT_KEYS,
  headerBuilderDocumentKeyForSectionId,
  headerBuilderDocumentKeyForView,
  headerBuilderDocumentSectionId,
  headerBuilderViewForDocumentKey,
  isHeaderBuilderDocumentKey,
} from "@/lib/headerBuilderDocumentKeys";
import { createYoothemeThemeSettings } from "@/lib/builderThemeSettings";
import {
  applyYoothemeHeaderDocumentImport,
  getYoothemeHeaderDocumentSettings,
} from "@/lib/yoothemeHeaderRecipe";

const source = JSON.parse(
  readFileSync("tests/fixtures/yootheme-jack-theme-settings.json", "utf8"),
);
const theme = createYoothemeThemeSettings(source);

function headerState(sectionId: string): BuilderState {
  return {
    page: "header",
    targetType: "header",
    design: {},
    sections: [
      {
        id: sectionId,
        kind: "contentLayout",
        title: "Authored Header",
        background: "transparent",
        visible: true,
        layout: "whole",
        rows: [
          {
            id: "authored-row",
            layout: "whole",
            columns: [
              {
                id: "authored-column",
                elements: [
                  {
                    id: "authored-navigation",
                    kind: "menu",
                    menuSource: "primary",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function legacyHeaderLayout(): BuilderLayout {
  return {
    version: 1,
    key: "header",
    page: "header",
    targetType: "header",
    design: {},
    updatedAt: "2026-09-19T00:00:00.000Z",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Legacy Header",
        background: "transparent",
        visible: true,
        layout: "whole",
        layoutColumns: 1,
        headerArchitectureVersion: 2,
        headerBehavior: "sticky",
        headerMobileBreakpoint: "900px",
        headerMobileBehavior: "static",
        headerMobileDialogLayout: "modal-center",
        headerMobileDialogClose: true,
        headerMobileOffcanvasMode: "push",
        rows: [
          {
            id: "shared-toolbar-row",
            layout: "whole",
            columns: [
              {
                id: "shared-toolbar-column",
                elements: [
                  {
                    id: "header-logo",
                    kind: "image",
                    imageUrl: "/desktop.svg",
                    imageMobileUrl: "/mobile.svg",
                  },
                ],
              },
            ],
          },
          {
            id: "desktop-only-row",
            headerVariant: "desktop",
            layout: "whole",
            columns: [
              {
                id: "desktop-only-column",
                elements: [
                  {
                    id: "desktop-navigation",
                    kind: "menu",
                    menuSource: "desktop",
                  },
                ],
              },
            ],
          },
          {
            id: "mobile-only-row",
            headerVariant: "mobile",
            layout: "whole",
            columns: [
              {
                id: "mobile-only-column",
                elements: [
                  {
                    id: "header-navigation",
                    kind: "menu",
                    menuSource: "mobile",
                  },
                ],
              },
            ],
          },
          {
            id: "mobile-dialog-row",
            headerVariant: "mobile-dialog",
            layout: "whole",
            columns: [
              {
                id: "mobile-dialog-column",
                elements: [
                  {
                    id: "dialog-navigation",
                    kind: "menu",
                    menuSource: "drawer",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

test("Header Builder surfaces have distinct stable document and selection identities", () => {
  const entries = [
    ["desktop", "header", "header-document"],
    ["mobile", "header-mobile", "header-mobile-document"],
    ["dialog", "header-mobile-dialog", "header-mobile-dialog-document"],
  ] as const;

  expect(HEADER_BUILDER_DOCUMENT_KEYS).toEqual(entries.map(([, key]) => key));
  expect(new Set(entries.map(([, , sectionId]) => sectionId)).size).toBe(3);

  for (const [view, key, sectionId] of entries) {
    expect(headerBuilderDocumentKeyForView(view)).toBe(key);
    expect(headerBuilderDocumentKeyForSectionId(sectionId)).toBe(key);
    expect(headerBuilderViewForDocumentKey(key)).toBe(view);
    expect(headerBuilderDocumentSectionId(key)).toBe(sectionId);
    expect(isHeaderBuilderDocumentKey(key)).toBe(true);
  }
  expect(
    headerBuilderDocumentKeyForSectionId("header-mobile-menu-document"),
  ).toBeNull();
  expect(isHeaderBuilderDocumentKey("header-mobile-menu")).toBe(false);
});

test("YOOtheme Theme Settings move mobile and drawer fields into their owning documents", () => {
  const desktop = getYoothemeHeaderDocumentSettings(theme, "desktop");
  const mobile = getYoothemeHeaderDocumentSettings(theme, "mobile");
  const dialog = getYoothemeHeaderDocumentSettings(theme, "dialog");

  expect(desktop).toMatchObject({
    headerArchitectureVersion: 2,
    headerBehavior: "sticky-on-scroll-up",
    headerDialogLayout: "offcanvas-top",
    headerMobileBreakpoint: "1200px",
    headerMobileComposition: "separate",
  });
  expect(
    Object.keys(desktop).filter((key) => key.startsWith("headerMobile")),
  ).toEqual(["headerMobileBreakpoint", "headerMobileComposition"]);

  expect(mobile).toMatchObject({
    headerArchitectureVersion: 2,
    headerDocumentVariant: "mobile",
    headerBreakpoint: "1200px",
    headerBehavior: "static",
    headerSearchPosition: "right",
    headerSearchLayout: "input-dropdown",
    headerSearchDropdownStretch: "navbar",
    headerDialogTogglePosition: "mobile-end",
    headerMobileLogoUrl: "wp-content/uploads/yootheme/logo-mobile.svg",
  });
  expect(mobile).not.toHaveProperty("headerMobileBehavior");
  expect(mobile).not.toHaveProperty("headerMobileSearchPosition");
  expect(mobile).not.toHaveProperty("headerMobileDialogLayout");

  expect(dialog).toMatchObject({
    headerArchitectureVersion: 2,
    headerDocumentVariant: "dialog",
    headerDialogLayout: "modal-center",
    headerDialogClose: true,
    headerDialogMenuStyle: "default",
    headerOffcanvasMode: "push",
    headerOffcanvasFlip: false,
    headerOffcanvasOverlay: true,
    headerDialogDropbarAnimation: "reveal-top",
  });
  expect(dialog).not.toHaveProperty("headerMobileDialogLayout");
  expect(dialog).not.toHaveProperty("headerMobileOffcanvasMode");
});

test("the split-document import keeps authored rows local to each Header surface", () => {
  const desktop = applyYoothemeHeaderDocumentImport(
    {
      ...headerState("header-document"),
      sections: [
        {
          ...headerState("header-document").sections[0]!,
          headerMobileSearchPosition: "legacy-only-mobile-field",
        },
      ],
    },
    theme,
    "desktop",
    "settings-only",
  );
  const mobile = applyYoothemeHeaderDocumentImport(
    headerState("header-mobile-document"),
    theme,
    "mobile",
    "settings-only",
  );
  const dialog = applyYoothemeHeaderDocumentImport(
    headerState("header-mobile-dialog-document"),
    theme,
    "dialog",
    "replace-from-recipe",
  );
  const desktopRecipe = applyYoothemeHeaderDocumentImport(
    headerState("header-document"),
    theme,
    "desktop",
    "replace-from-recipe",
  );

  expect(desktop.sections[0]?.rows?.map((row) => row.id)).toEqual([
    "authored-row",
  ]);
  expect(desktop.sections[0]).not.toHaveProperty("headerMobileSearchPosition");
  expect(desktop.sections[0]).toMatchObject({
    headerMobileBreakpoint: "1200px",
  });
  expect(desktopRecipe.sections[0]?.rows?.map((row) => row.id)).toEqual([
    "header-main-row",
  ]);
  expect(desktopRecipe.sections[0]?.rows?.[0]?.headerVariant).toBeUndefined();

  expect(mobile.sections[0]?.rows?.map((row) => row.id)).toEqual([
    "authored-row",
  ]);
  expect(mobile.sections[0]).toMatchObject({
    id: "header-mobile-document",
    headerDocumentVariant: "mobile",
    headerSearchPosition: "right",
  });

  // A drawer document has its own authored rows. Recipe mode may seed a
  // mobile Header, but must never replace the dialog's authored structure.
  expect(dialog.sections[0]?.rows?.map((row) => row.id)).toEqual([
    "authored-row",
  ]);
  expect(dialog.sections[0]).toMatchObject({
    id: "header-mobile-dialog-document",
    headerDocumentVariant: "dialog",
    headerDialogLayout: "modal-center",
  });
});

test("a unified mobile Header workspace is created only by an explicit mobile Builder action", async () => {
  const dataDir = await mkdtemp(
    path.join(os.tmpdir(), "webpages-header-documents-"),
  );
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scope = { websiteId: "header-document-split" };
  try {
    await writeBuilderLayoutStore({ header: legacyHeaderLayout() }, scope);

    const readOnly = await getHeaderBuilderDocuments(
      defaultBuilderShellSettings,
      scope,
      false,
    );
    expect(readOnly.desktop.key).toBe("header");
    expect(readOnly.mobile).toBeNull();
    expect(readOnly.dialog).toBeNull();
    expect(await readBuilderLayoutStore(scope)).not.toHaveProperty(
      "header-mobile",
    );
    expect(await readBuilderLayoutStore(scope)).not.toHaveProperty(
      "header-mobile-dialog",
    );

    const created = await ensureHeaderBuilderDocuments(
      defaultBuilderShellSettings,
      scope,
      false,
    );
    expect(created.mobile).toMatchObject({
      key: "header-mobile",
      page: "header-mobile",
      targetType: "header",
    });
    expect(created.mobile?.sections[0]).toMatchObject({
      id: "header-mobile-document",
      headerDocumentVariant: "mobile",
      headerBehavior: "static",
      headerBreakpoint: "900px",
    });
    expect(created.mobile?.sections[0]?.rows?.map((row) => row.id)).toEqual([
      "shared-toolbar-row",
      "mobile-only-row",
    ]);
    expect(
      created.mobile?.sections[0]?.rows?.every(
        (row) => row.headerVariant === undefined,
      ),
    ).toBe(true);
    expect(
      created.mobile?.sections[0]?.rows?.[0]?.columns[0]?.elements[0],
    ).toMatchObject({
      id: "header-mobile-logo",
      imageUrl: "/mobile.svg",
    });

    expect(created.mobile?.sections[1]).toMatchObject({
      id: "header-mobile-dialog-document",
      headerDocumentVariant: "dialog",
      headerDialogLayout: "modal-center",
      headerDialogClose: true,
      headerOffcanvasMode: "push",
    });
    expect(created.mobile?.sections[1]?.rows?.map((row) => row.id)).toEqual([
      "mobile-dialog-row",
    ]);
    expect(
      created.mobile?.sections[1]?.rows?.[0]?.headerVariant,
    ).toBeUndefined();
    // Existing readers can keep consuming the compatibility projection, but
    // it has no independent persistence owner.
    expect(created.dialog).toMatchObject({
      key: "header-mobile-dialog",
      page: "header-mobile-dialog",
      targetType: "header",
    });
    expect(created.dialog?.sections[0]).toEqual(created.mobile?.sections[1]);

    const persisted = await readBuilderLayoutStore(scope);
    expect(persisted.header?.sections[0]?.rows?.map((row) => row.id)).toEqual([
      "shared-toolbar-row",
      "desktop-only-row",
      "mobile-only-row",
      "mobile-dialog-row",
    ]);
    expect(
      persisted["header-mobile"]?.sections.map((section) => section.id),
    ).toEqual(["header-mobile-document", "header-mobile-dialog-document"]);
    expect(persisted).not.toHaveProperty("header-mobile-dialog");
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("canonical mobile rows reconcile legacy blocks once and keep canonical blocks", () => {
  const section: BuilderSection = {
    id: "header-mobile-dialog-document",
    kind: "contentLayout",
    title: "Mobile Menu Dialog",
    background: "transparent",
    visible: true,
    layout: "whole",
    rows: [
      {
        id: "drawer-row",
        layout: "whole",
        columns: [
          {
            id: "drawer",
            elements: [
              { id: "cart", kind: "headerCart", title: "Canonical cart" },
            ],
          },
        ],
      },
    ],
    layoutItems: [
      {
        id: "drawer",
        rowId: "drawer-row",
        rowLayout: "whole",
        blocks: [
          { id: "cart", kind: "headerCart", title: "Legacy cart" },
          { id: "account", kind: "headerAccount", title: "Account" },
        ],
      },
    ],
  };

  const once = reconcileHeaderSectionRows(section);
  const twice = reconcileHeaderSectionRows(once);
  const elements = once.rows?.[0]?.columns[0]?.elements ?? [];

  expect(once.layoutItems).toBeUndefined();
  expect(elements.map((block) => block.id)).toEqual(["cart", "account"]);
  expect(elements[0]).toMatchObject({ id: "cart", title: "Canonical cart" });
  expect(twice).toEqual(once);
});

test("an existing standalone drawer migrates into the mobile workspace without changing its legacy source", async () => {
  const dataDir = await mkdtemp(
    path.join(os.tmpdir(), "webpages-header-drawer-migration-"),
  );
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scope = { websiteId: "header-drawer-migration" };
  try {
    const legacyDrawer: BuilderLayout = {
      version: 1,
      key: "header-mobile-dialog",
      page: "header-mobile-dialog",
      targetType: "header",
      design: {},
      updatedAt: "2026-09-19T00:00:00.000Z",
      sections: [
        {
          id: "header-mobile-dialog-document",
          kind: "contentLayout",
          title: "Legacy Mobile Menu Dialog",
          headerDocumentVariant: "dialog",
          headerArchitectureVersion: 2,
          background: "transparent",
          visible: true,
          layout: "whole",
          rows: [
            {
              id: "drawer-row",
              layout: "whole",
              columns: [
                {
                  id: "drawer",
                  elements: [
                    { id: "cart", kind: "headerCart", title: "Canonical cart" },
                  ],
                },
              ],
            },
          ],
          layoutItems: [
            {
              id: "drawer",
              rowId: "drawer-row",
              rowLayout: "whole",
              blocks: [
                { id: "cart", kind: "headerCart", title: "Legacy cart" },
                { id: "account", kind: "headerAccount", title: "Account" },
              ],
            },
          ],
        },
      ],
    };
    const legacySnapshot = structuredClone(legacyDrawer);
    const mobileBar: BuilderLayout = {
      version: 1,
      key: "header-mobile",
      page: "header-mobile",
      targetType: "header",
      design: {},
      updatedAt: "2026-09-19T00:00:00.000Z",
      sections: [
        {
          id: "header-mobile-document",
          kind: "contentLayout",
          title: "Mobile Header",
          headerDocumentVariant: "mobile",
          headerArchitectureVersion: 2,
          background: "transparent",
          visible: true,
          layout: "whole",
          rows: [
            {
              id: "mobile-row",
              layout: "whole",
              columns: [
                {
                  id: "mobile-content",
                  elements: [
                    {
                      id: "mobile-logo",
                      kind: "image",
                      imageUrl: "/mobile.svg",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    await writeBuilderLayoutStore(
      {
        header: legacyHeaderLayout(),
        "header-mobile": mobileBar,
        "header-mobile-dialog": legacyDrawer,
      },
      scope,
    );

    const migrated = await ensureHeaderBuilderDocuments(
      defaultBuilderShellSettings,
      scope,
      false,
    );
    expect(migrated.mobile?.sections.map((section) => section.id)).toEqual([
      "header-mobile-document",
      "header-mobile-dialog-document",
    ]);
    const drawer = migrated.mobile?.sections[1];
    expect(drawer?.layoutItems).toBeUndefined();
    expect(
      drawer?.rows?.[0]?.columns[0]?.elements.map((block) => block.id),
    ).toEqual(["cart", "account"]);
    expect(drawer?.rows?.[0]?.columns[0]?.elements[0]).toMatchObject({
      id: "cart",
      title: "Canonical cart",
    });
    expect(migrated.dialog?.sections[0]).toEqual(drawer);

    const persisted = await readBuilderLayoutStore(scope);
    expect(persisted["header-mobile-dialog"]).toEqual(legacySnapshot);

    const repeated = await ensureHeaderBuilderDocuments(
      defaultBuilderShellSettings,
      scope,
      false,
    );
    expect(repeated.mobile).toEqual(migrated.mobile);
    expect(
      repeated.mobile?.sections[1]?.rows?.[0]?.columns[0]?.elements.map(
        (block) => block.id,
      ),
    ).toEqual(["cart", "account"]);
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});
