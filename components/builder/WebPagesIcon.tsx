"use client";

import { useEffect, useRef, useState } from "react";
import uikitModule from "uikit";
import uikitIconsModule from "uikit/dist/js/uikit-icons";
import { resolveUikitIconName, type UikitIconName } from "@/lib/uikitIconRegistry";

type UIKitModule = {
  use?: (plugin: unknown) => void;
  icon?: (
    element: HTMLElement,
    data?: { icon?: string; width?: number; height?: number },
  ) => { svg?: Promise<unknown> } | undefined;
};

const uikit = (uikitModule ?? {}) as UIKitModule;
const uikitIcons = uikitIconsModule ?? {};
uikit.use?.(uikitIcons);

export type WebPagesIconProps = {
  name?: string | null;
  size?: number;
  className?: string;
  label?: string;
};

/** The only document-icon renderer used by builder and published frontend. */
export function WebPagesIcon({ name, size = 20, className, label }: WebPagesIconProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const resolvedName = resolveUikitIconName(name);

  useEffect(() => {
    const element = ref.current;
    if (!element || !resolvedName) return;

    element.replaceChildren();
    let cancelled = false;
    let commitTimer: ReturnType<typeof setTimeout> | undefined;
    setSvgMarkup(null);

    if (uikit.icon) {
      const instance = uikit.icon(element, {
        icon: resolvedName,
        width: size,
        height: size,
      });
      void instance?.svg?.then((svg) => {
        if (cancelled || !(svg instanceof SVGElement)) return;
        const markup = svg.outerHTML;
        commitTimer = setTimeout(() => {
          if (cancelled) return;
          element.replaceChildren();
          setSvgMarkup(markup);
        }, 0);
      });
    }

    return () => {
      cancelled = true;
      if (commitTimer) clearTimeout(commitTimer);
    };
  }, [resolvedName, size]);

  if (!resolvedName) return null;

  return (
    <span
      ref={ref}
      className={className ? `webpages-icon uk-icon ${className}` : "webpages-icon uk-icon"}
      data-webpages-icon={resolvedName}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      style={{ width: size, height: size, flex: `0 0 ${size}px` }}
      dangerouslySetInnerHTML={svgMarkup ? { __html: svgMarkup } : undefined}
    />
  );
}

export type { UikitIconName };
