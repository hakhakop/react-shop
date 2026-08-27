import { expect, test } from "@playwright/test";
import { normalizeBuilderShellSettings } from "@/lib/builderShell";
import { resolveHeaderBuilderComposition } from "@/lib/headerBuilderComposition";
import { resolveHeaderMenuSourceItems } from "@/lib/headerMenuSources";

test("normalizes named menus without losing order, hierarchy, URLs, or targets", () => {
  const shell = normalizeBuilderShellSettings({
    menuItems: [{ id: "main-home", label: "Home", url: "/" }],
    namedMenus: [{
      id: "header-book-me",
      name: "Header Book Me",
      items: [
        { id: "book-me", label: "Book me", url: "?page_id=24", target: "_self" },
        { id: "book-me-child", parentId: "book-me", label: "Details", url: "/details", target: "_blank" },
      ],
    }],
  });

  expect(shell.namedMenus).toEqual([{
    id: "header-book-me",
    name: "Header Book Me",
    items: [
      expect.objectContaining({ id: "book-me", label: "Book me", url: "?page_id=24", parentId: null, target: "_self" }),
      expect.objectContaining({ id: "book-me-child", label: "Details", url: "/details", parentId: "book-me", target: "_blank" }),
    ],
  }]);
});

test("resolves each Header Menu element independently and preserves legacy fallback", () => {
  const shell = normalizeBuilderShellSettings({
    menuItems: [
      { id: "main-home", label: "Home", url: "/" },
      { id: "main-about", label: "About", url: "/about" },
    ],
    namedMenus: [{
      id: "header-book-me",
      name: "Header Book Me",
      items: [{ id: "book-me", label: "Book me", url: "?page_id=24" }],
    }],
  });

  expect(resolveHeaderMenuSourceItems(shell, "main").map((item) => item.label)).toEqual(["Home", "About"]);
  expect(resolveHeaderMenuSourceItems(shell, "header-book-me").map((item) => item.label)).toEqual(["Book me"]);
  expect(resolveHeaderMenuSourceItems(shell).map((item) => item.label)).toEqual(["Home", "About"]);
  expect(resolveHeaderMenuSourceItems(shell, "legacy-unknown-source").map((item) => item.label)).toEqual(["Home", "About"]);
});

test("carries independent menuSource values through the canonical Header composition", () => {
  const composition = resolveHeaderBuilderComposition({
    sections: [{
      id: "header-document",
      kind: "contentLayout",
      title: "Header",
      background: "transparent",
      visible: true,
      layoutItems: [
        {
          id: "header-main-center",
          rowId: "header-main-row",
          blocks: [{ id: "header-navigation", kind: "menu", menuSource: "main" }],
        },
        {
          id: "header-main-right",
          rowId: "header-main-row",
          blocks: [{ id: "header-book-me-menu", kind: "menu", menuSource: "header-book-me" }],
        },
      ],
    }],
  });

  expect(composition.elements).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: "header-navigation", type: "navigation", menuSource: "main" }),
    expect.objectContaining({ id: "header-book-me-menu", type: "navigation", menuSource: "header-book-me" }),
  ]));
  expect(JSON.stringify(composition)).not.toMatch(/widget|header:end|navbar/);
});
