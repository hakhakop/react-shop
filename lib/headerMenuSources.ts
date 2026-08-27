import type { BuilderShellSettings, ReactMenuItem } from "@/lib/builderShell";

/** Resolve one Header Menu element without coupling it to other Menu blocks. */
export function resolveHeaderMenuSourceItems(
  shellSettings: Pick<Partial<BuilderShellSettings>, "menuItems" | "namedMenus">,
  menuSource?: string,
): ReactMenuItem[] {
  const source = menuSource?.trim();
  if (source && source !== "main") {
    const namedMenu = shellSettings.namedMenus?.find((menu) => menu.id === source);
    if (namedMenu) return namedMenu.items;
  }

  return shellSettings.menuItems ?? [];
}
