"use client";

import { useEffect, useRef } from "react";

export type UikitAccordionItem = {
  id: string;
  title: string;
  content: string;
};

type Props = {
  items: UikitAccordionItem[];
  multiple?: boolean;
  collapsible?: boolean;
 active?: number[];
  indicator?: "none" | "chevron" | "plus-minus";
  indicatorPosition?: "start" | "end";
  rowStyle?: "plain" | "divided" | "striped";
  spacing?: "compact" | "default" | "large";
  titleEmphasis?: "default" | "bold";
  openEmphasis?: "none" | "muted" | "primary";
};

export default function UikitAccordion({ items, multiple = false, collapsible = true, active = [], indicator = "none", indicatorPosition = "end", rowStyle = "plain", spacing = "default", titleEmphasis = "default", openEmphasis = "none" }: Props) {
  const rootRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let instance: { $destroy?: (remove?: boolean) => void } | undefined;
    let cancelled = false;

    import("uikit").then((module) => {
      if (cancelled || !rootRef.current) return;
     const UIkit = (module.default ?? module) as {
       accordion: (element: HTMLElement, options: Record<string, unknown>) => { $destroy?: (remove?: boolean) => void };
        icon?: (element: HTMLElement) => unknown;
     };
     instance = UIkit.accordion(rootRef.current, {
       multiple,
       collapsible,
       active: active.length > 0 ? active : false,
       animation: true,
     });
      rootRef.current.querySelectorAll<HTMLElement>("[uk-icon]").forEach((icon) => UIkit.icon?.(icon));
    });

    return () => {
      cancelled = true;
      // Keep the React-owned root in place; UIkit should only release its listeners.
      instance?.$destroy?.();
    };
  }, [active, collapsible, multiple, items, indicator]);

  return (
    <ul
      ref={rootRef}
      className="uk-accordion uk-accordion-default shop-builder-accordion"
      uk-accordion=""
     data-accordion-multiple={multiple ? "true" : "false"}
     data-accordion-collapsible={collapsible ? "true" : "false"}
      data-accordion-indicator={indicator}
      data-accordion-indicator-position={indicatorPosition}
      data-accordion-row-style={rowStyle}
      data-accordion-spacing={spacing}
      data-accordion-title-emphasis={titleEmphasis}
      data-accordion-open-emphasis={openEmphasis}
   >
      {items.map((item) => (
        <li key={item.id} data-accordion-item-id={item.id}>
          <a className="uk-accordion-title" href="#">
            {indicator === "plus-minus" && <span className="uk-accordion-icon" uk-icon="icon: accordion-icon" aria-hidden="true" />}
            {indicator === "chevron" && <span className="shop-builder-accordion-indicator" aria-hidden="true" />}
            <span className="shop-builder-accordion-title-text">{item.title}</span>
          </a>
          <div className="uk-accordion-content">
            <p className="uk-margin-remove-bottom">{item.content}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
