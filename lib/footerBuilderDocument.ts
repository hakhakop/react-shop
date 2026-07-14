import type { BuilderDataScope, BuilderLayout } from "@/lib/builderLayouts";
import { getOrCreateBuilderDocumentLayout } from "@/lib/builderDocument";

export function createLegacyEquivalentFooterLayout(): BuilderLayout {
  return {
    version: 1,
    key: "footer",
    page: "footer",
    targetType: "footer",
    design: {},
    sections: [
      {
        id: "footer-document",
        kind: "contentLayout",
        title: "Footer",
        background: "#111111",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "dark",
        topSpacing: "sm",
        bottomSpacing: "sm",
        layout: "halves",
        layoutColumns: 2,
        layoutItems: [
          {
            id: "footer-main-left",
            rowId: "footer-main-row",
            rowLayout: "halves",
            blocks: [
              {
                id: "footer-copyright",
                kind: "text",
                body: "© 2025 Webpages · Headless WooCommerce demo",
              },
            ],
          },
          {
            id: "footer-main-right",
            rowId: "footer-main-row",
            rowLayout: "halves",
            blocks: [
              {
                id: "footer-platform",
                kind: "text",
                body: "Powered by WordPress · WooCommerce · WPGraphQL · Next.js",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function getOrCreateFooterBuilderLayout(scope: BuilderDataScope = {}) {
  return getOrCreateBuilderDocumentLayout({
    key: "footer",
    scope,
    create: createLegacyEquivalentFooterLayout,
  });
}
