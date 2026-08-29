"use client";

import { createElement, Fragment } from "react";
import type { InspectorPanelContext, InspectorElementCapabilityDeclaration } from "@/components/dashboard/inspector/inspectorRouting";
import GeneralSettingsPanel from "@/components/dashboard/inspector/panels/GeneralSettingsPanel";
import ElementAdvancedPanel from "@/components/dashboard/inspector/panels/ElementAdvancedPanel";
import DynamicContentInspectorGroup from "@/components/dashboard/inspector/panels/DynamicContentInspectorGroup";

type Props = InspectorPanelContext & {
  declaration: InspectorElementCapabilityDeclaration;
};

/**
 * Canonical element capability composer.
 *
 * Element panels render semantic fields only. Following the Builder reference
 * model, visual and geometry controls compose into one stable Settings surface.
 * All panels still receive the same canonical update callback.
 */
export default function ElementCapabilityComposer({ declaration, ...context }: Props) {
  const { panel, settingsSources = ["style"] } = declaration;

  if (context.tab === "settings") {
    return (
      <div className="builder-inspector-stack" data-inspector-composition="settings">
        {settingsSources.map((source) => (
          <Fragment key={source}>
            {createElement(panel, { ...context, tab: source })}
          </Fragment>
        ))}
        {declaration.composes.includes("general") && (
          <GeneralSettingsPanel
            {...context}
            tab="layout"
            showAnimation={declaration.composes.includes("animation")}
          />
        )}
      </div>
    );
  }

  if (context.tab === "style") {
    return (
      <div className="builder-inspector-stack" data-inspector-composition="style">
        {settingsSources.filter((source) => source !== "layout").map((source) => (
          <Fragment key={source}>
            {createElement(panel, { ...context, tab: source })}
          </Fragment>
        ))}
      </div>
    );
  }

  if (context.tab === "layout") {
    return (
      <div className="builder-inspector-stack" data-inspector-composition="layout">
        {settingsSources.includes("layout") && createElement(panel, { ...context, tab: "layout" })}
        {declaration.composes.includes("general") && (
          <GeneralSettingsPanel
            {...context}
            tab="layout"
            showAnimation={false}
          />
        )}
      </div>
    );
  }

  if (context.tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-inspector-composition="advanced">
        {declaration.dynamicSourceSurface === "element" && (
          <DynamicContentInspectorGroup item={context.block} update={context.update} categoryTree={context.previewCategoryTree} />
        )}
        <ElementAdvancedPanel block={context.block} update={context.update} />
      </div>
    );
  }

  return createElement(panel, context);
}
