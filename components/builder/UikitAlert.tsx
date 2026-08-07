"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitAlertClass } from "@/lib/uikitTokens";

type Props = {
  block: any;
};

export default function UikitAlert({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const alertStatus = rawBlock.status || rawBlock.alertStyle || rawBlock.preset || "primary";
  const alertClass = `uk-alert ${getUikitAlertClass(alertStatus)}`;

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--alert ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <div className={alertClass} data-uk-alert>
        {rawBlock.alertClose !== false && (
          <a className="uk-alert-close" data-uk-close aria-label="Close" />
        )}
        {rawBlock.title && <h4 className="uk-margin-remove-top">{rawBlock.title}</h4>}
        {rawBlock.body && <p className="uk-margin-remove-bottom">{rawBlock.body}</p>}
        {!rawBlock.body && rawBlock.content && <p className="uk-margin-remove-bottom">{rawBlock.content}</p>}
      </div>
    </div>
  );
}
