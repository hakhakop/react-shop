"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import UikitStylableSvg from "@/components/builder/UikitStylableSvg";
import {
  getUikitButtonClass,
  getUikitImageClass,
  getUikitImageStyle,
  getUikitSvgColor,
  getUikitSvgColorClass,
  getUikitTableClass,
  resolveUikitImageSemantics,
} from "@/lib/uikitTokens";
import { sanitizeHtml, isRichText } from "@/lib/safeHtml";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";

type Props = {
  block: any;
};

export default function UikitTable({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const headings: string[] = rawBlock.tableHeadings ?? ["Header 1", "Header 2", "Header 3"];
  const rows: string[][] = rawBlock.tableRows ?? [
    ["Item A", "Description A", "$10.00"],
    ["Item B", "Description B", "$20.00"],
  ];
  const columnFields: string[] = rawBlock.tableColumnFields ?? headings.map((_, index) => `column-${index}`);
  const items: any[] = rawBlock.tableItems ?? [];

  const tableClass = getUikitTableClass(
    rawBlock.tableStyle,
    rawBlock.tableSize ?? rawBlock.size,
    rawBlock.tableHover,
    rawBlock.tableStriped
  );

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const textAlignClass = rawBlock.textAlign && rawBlock.textAlign !== "none" ? `uk-text-${rawBlock.textAlign}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  const responsiveClass = rawBlock.tableResponsive === "responsive" ? "uk-table-responsive" : "";
  const justifyClass = rawBlock.tableJustify ? "uk-table-justify" : "";
  const verticalClass = rawBlock.tableVerticalAlign ? "uk-table-middle" : "";
  const renderCell = (value: string) => {
    const safe = sanitizeHtml(value ?? "");
    return isRichText(safe) ? <span dangerouslySetInnerHTML={{ __html: safe }} /> : safe;
  };
  const imageSemantics = resolveUikitImageSemantics({
    imageFit: "natural",
    imageRatio: "natural",
    imageWidth: rawBlock.tableImageWidth,
    imageHeight: rawBlock.tableImageHeight,
    imageBorder: rawBlock.tableImageBorder,
    imageBoxShadow: rawBlock.tableImageShadow,
  });
  const imageStyle = getUikitImageStyle(imageSemantics);
  const imageClass = `${getUikitImageClass(imageSemantics)} el-image uk-preserve-width`.trim();
  const isStylableSvg = rawBlock.tableImageSvgInline === true;
  const svgColorClass = getUikitSvgColorClass(rawBlock.tableImageSvgColor);
  const renderMedia = (item: any) => {
    if (rawBlock.tableShowImage === false || !item.imageUrl) return null;
    const sharedStyle = {
      width: imageStyle.width,
      height: imageStyle.height,
      maxWidth: "100%",
      objectFit: imageStyle.objectFit,
    } as const;
    if (isStylableSvg && /\.svg(?:[?#].*)?$/i.test(item.imageUrl)) {
      return (
        <UikitStylableSvg
          src={item.imageUrl}
          alt={item.imageAlt ?? item.title ?? ""}
          className={`${imageClass} ${svgColorClass}`.trim()}
          color={svgColorClass ? undefined : getUikitSvgColor(rawBlock.tableImageSvgColor)}
          fit="contain"
          loading={rawBlock.tableImageLoading === "eager" ? "eager" : "lazy"}
          fallback={<img src={item.imageUrl} alt={item.imageAlt ?? item.title ?? ""} className={imageClass} loading={rawBlock.tableImageLoading === "eager" ? "eager" : "lazy"} style={sharedStyle} />}
          style={sharedStyle}
        />
      );
    }
    return <img src={item.imageUrl} alt={item.imageAlt ?? item.title ?? ""} className={imageClass} loading={rawBlock.tableImageLoading === "eager" ? "eager" : "lazy"} style={sharedStyle} />;
  };
  const renderAction = (item: any) => {
    if (rawBlock.tableShowLink === false || !item.linkUrl || !item.linkLabel) return null;
    const style = String(rawBlock.tableLinkStyle ?? "default");
    const className = style === "link-muted"
      ? "uk-link-muted"
      : style === "link-text"
        ? "uk-link-text"
        : getUikitButtonClass(style, rawBlock.tableLinkSize);
    const fullWidthClass = rawBlock.tableLinkFullWidth
      ? rawBlock.tableResponsive === "responsive" ? "uk-width-auto uk-width-1-1@m" : "uk-width-1-1"
      : "";
    return (
      <a href={item.linkUrl} className={`${className} ${fullWidthClass}`.trim()} {...builderLinkTargetProps(item.linkTarget ?? rawBlock.tableLinkTarget)}>
        {item.linkLabel}
      </a>
    );
  };
  const renderStructuredCell = (item: any, field: string) => {
    if (field === "image") return renderMedia(item);
    if (field === "link") return renderAction(item);
    return renderCell(item[field] ?? "");
  };
  const renderedRows = items.length > 0
    ? items.map((item) => columnFields.map((field) => renderStructuredCell(item, field)))
    : rows.map((row) => row.map((value) => renderCell(value)));
  const renderedColumnCount = Math.max(headings.length, columnFields.length, ...renderedRows.map((row) => row.length), 0);
  const table = (
    <table className={`${tableClass} ${responsiveClass} ${justifyClass} ${verticalClass}`.trim()}>
      {headings.length > 0 && (
        <thead>
          <tr>
            {headings.map((heading, hIdx) => (
              <th key={hIdx}>{renderCell(heading)}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {renderedRows.map((row, rIdx) => (
          <tr key={rIdx}>
            {Array.from(
              { length: renderedColumnCount },
              (_, cIdx) => (
                <td key={cIdx} className={rawBlock.tableLastAlign && cIdx === renderedColumnCount - 1 ? `uk-text-${rawBlock.tableLastAlign}` : ""}>{row[cIdx] ?? null}</td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--table ${marginClass} ${textAlignClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      {rawBlock.tableResponsive === "overflow" ? <div className="uk-overflow-auto">{table}</div> : table}
    </div>
  );
}
