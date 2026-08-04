"use client";

import { createElement, Fragment } from "react";
import type { InspectorPanelContext, InspectorElementCapabilityDeclaration } from "@/components/dashboard/inspector/inspectorRouting";
import GeneralSettingsPanel from "@/components/dashboard/inspector/panels/GeneralSettingsPanel";

type Props = InspectorPanelContext & {
  declaration: InspectorElementCapabilityDeclaration;
};

/**
 * Canonical element capability composer.
 *
 * Element panels render semantic fields only. Shared General capabilities
 * are injected here, and the registry decides which semantic
 * panel sections belong in the single Settings tab.
 */
export default function ElementCapabilityComposer({ declaration, ...context }: Props) {
  const { panel, settingsSources = ["style"] } = declaration;

  if (context.tab === "style") {
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
            tab="style"
            showAnimation={declaration.composes.includes("animation")}
          />
        )}
      </div>
    );
  }

  if (context.tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-inspector-composition="advanced">
        {createElement(panel, context)}
      </div>
    );
  }

  return createElement(panel, context);
}
