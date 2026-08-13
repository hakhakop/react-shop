"use client";

import type { CSSProperties } from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitAlertClass, getUikitAlertPresentationStyle, getUikitHeadingClass, getUikitTextClass } from "@/lib/uikitTokens";
import { sanitizeHtml } from "@/lib/safeHtml";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";

type Props = {
  block: any;
};

export default function UikitAlert({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const alertStatus = rawBlock.alertStyle ?? rawBlock.status ?? rawBlock.preset ?? "default";
  const alertClass = getUikitAlertClass(alertStatus);
  const Title = ["h1", "h2", "h3", "h4", "h5", "h6", "div"].includes(rawBlock.alertTitleElement)
    ? rawBlock.alertTitleElement
    : "h3";
  const content = sanitizeHtml(rawBlock.body ?? rawBlock.content ?? "");
  const titleClass = `el-title ${getUikitHeadingClass(Title, rawBlock.alertTitleStyle)} ${rawBlock.alertTitleInline ? "uk-display-inline uk-text-middle" : ""}`.trim();
  const contentClass = `el-content uk-panel ${getUikitTextClass(rawBlock.alertContentStyle)} ${rawBlock.alertTitleInline ? "uk-display-inline uk-text-middle" : rawBlock.alertContentMargin === "none" ? "uk-margin-remove-top" : rawBlock.alertContentMargin ? `uk-margin-${rawBlock.alertContentMargin}-top` : ""}`.trim();
  const body = (
    <>
      {rawBlock.title && <Title className={titleClass}>{rawBlock.title}</Title>}
      {content && <div className={contentClass} dangerouslySetInnerHTML={{ __html: content }} />}
    </>
  );

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--alert ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <div
        className={`${alertClass} ${rawBlock.alertLarge ? "uk-padding" : ""}`.trim()}
        style={getUikitAlertPresentationStyle(alertStatus) as CSSProperties}
        data-uk-alert
      >
        {rawBlock.alertClose === true && (
          <a className="uk-alert-close" data-uk-close aria-label="Close" />
        )}
        {rawBlock.alertLinkUrl
          ? <a className="uk-link-reset" href={rawBlock.alertLinkUrl} {...builderLinkTargetProps(rawBlock.alertLinkTarget ?? "_self")}>{body}</a>
          : body}
      </div>
    </div>
  );
}
