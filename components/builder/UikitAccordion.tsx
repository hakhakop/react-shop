"use client";

import { useEffect, useRef } from "react";
import UikitText from "@/components/builder/UikitText";
import { getUikitAccordionClass, getUikitAccordionItemClass, getUikitHeadingClass } from "@/lib/uikitTokens";

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
  style?: "default" | "divided" | "striped" | "minimal" | "boxed";
  indicator?: "default" | "plus-minus" | "chevron" | "none";
  indicatorPosition?: "start" | "end";
  titleEmphasis?: "inherit" | "muted" | "default" | "emphasis" | "bold";
  itemSpacing?: "inherit" | "small" | "default" | "large";
  contentSpacing?: "inherit" | "small" | "default" | "large";
  divider?: boolean;
  titleStyle?: "inherit" | "h3" | "h4" | "h5";
  contentStyle?: "inherit" | "default" | "lead" | "small" | "large" | "muted";
  /** Legacy semantic fields retained for safe document migration. */
  legacyRowStyle?: "plain" | "divided" | "striped";
  legacySpacing?: "compact" | "default" | "large";
  legacyOpenEmphasis?: "none" | "muted" | "primary";
};

export default function UikitAccordion({ items, multiple = false, collapsible = true, active = [], style: styleProp, indicator: indicatorProp, indicatorPosition = "end", titleEmphasis: titleEmphasisProp, itemSpacing: itemSpacingProp, contentSpacing = "inherit", divider = true, titleStyle = "inherit", contentStyle = "inherit", legacyRowStyle, legacySpacing, legacyOpenEmphasis }: Props) {
  const style = styleProp === "boxed" ? "striped" : styleProp ?? (legacyRowStyle === "divided" ? "divided" : legacyRowStyle === "striped" ? "striped" : "default");
  const indicator = indicatorProp ?? "default";
  const titleEmphasis = titleEmphasisProp === "bold" ? "emphasis" : titleEmphasisProp ?? (legacyOpenEmphasis === "muted" ? "muted" : legacyOpenEmphasis === "primary" ? "emphasis" : "inherit");
  const itemSpacing = itemSpacingProp ?? (legacySpacing === "compact" ? "small" : legacySpacing === "large" ? "large" : "inherit");
  const rootRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let instance: { $destroy?: (remove?: boolean) => void } | undefined;
    let cancelled = false;

    Promise.all([import("uikit"), import("uikit/dist/js/uikit-icons")]).then(([module, iconsModule]) => {
      if (cancelled || !rootRef.current) return;
     const UIkit = (module.default ?? module) as {
       accordion: (element: HTMLElement, options: Record<string, unknown>) => { $destroy?: (remove?: boolean) => void };
       icon?: (element: HTMLElement) => unknown;
       use?: (plugin: unknown) => void;
     };
     const registerPlugin = UIkit.use;
     registerPlugin?.(iconsModule.default ?? iconsModule);
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
      className={getUikitAccordionClass({ style, indicator, indicatorPosition, titleEmphasis, itemSpacing, contentSpacing, divider })}
      uk-accordion=""
     data-accordion-multiple={multiple ? "true" : "false"}
     data-accordion-collapsible={collapsible ? "true" : "false"}
   >
      {items.map((item) => (
        <li key={item.id} data-accordion-item-id={item.id} className={getUikitAccordionItemClass(style)}>
          <a className="uk-accordion-title" href="#">
            {indicator === "plus-minus" && <><span className="shop-builder-accordion-indicator shop-builder-accordion-indicator--plus" uk-icon="icon: plus" aria-hidden="true" /><span className="shop-builder-accordion-indicator shop-builder-accordion-indicator--minus" uk-icon="icon: minus" aria-hidden="true" /></>}
            {(indicator === "default" || indicator === "chevron") && <span className="shop-builder-accordion-indicator" uk-icon="icon: chevron-down" aria-hidden="true" />}
            <span className={`shop-builder-accordion-title-text ${titleStyle !== "inherit" ? getUikitHeadingClass(titleStyle, titleStyle) : ""}`}>{item.title}</span>
          </a>
          <div className="uk-accordion-content">
            <UikitText content={item.content} variant={contentStyle === "inherit" ? "default" : contentStyle} />
          </div>
        </li>
      ))}
    </ul>
  );
}
