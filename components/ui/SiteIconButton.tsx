"use client";

import * as React from "react";
import Link from "next/link";
import { SiteIcon, type SiteIconName } from "./SiteIcon";

type Size = "sm" | "md" | "lg";
type Variant = "ghost" | "muted" | "solid" | "icon";

type BaseProps = {
  icon: SiteIconName;
  size?: Size;
  variant?: Variant;
  badgeCount?: number;
  className?: string;
  "aria-label"?: string;
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: never;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonProps = BaseProps & {
  href?: undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export type SiteIconButtonProps = LinkProps | ButtonProps;

function sizeClasses(size: Size = "md") {
  switch (size) {
    case "sm":
      return "h-7 w-7";
    case "lg":
      return "h-10 w-10";
    case "md":
    default:
      return "h-8 w-8";
  }
}

function iconSizeClasses(size: Size = "md") {
  switch (size) {
    case "sm":
      return "h-3.5 w-3.5";
    case "lg":
      return "h-5 w-5";
    case "md":
    default:
      return "h-4 w-4";
  }
}

function variantClasses(variant: Variant = "ghost") {
  switch (variant) {
    case "muted":
      return "bg-muted hover:bg-muted/80";
    case "solid":
      return "bg-foreground text-background hover:bg-foreground/90";
    case "icon":
      return "bg-transparent hover:text-accent";
    case "ghost":
    default:
      return "bg-transparent hover:bg-muted";
  }
}

export function SiteIconButton(props: SiteIconButtonProps) {
  const {
    icon,
    size = "md",
    variant = "ghost",
    badgeCount,
    className,
    ...rest
  } = props as BaseProps & any;

  const isIconOnly = variant === "icon";

  const baseCommon =
    "relative inline-flex items-center justify-center transition no-underline text-foreground " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50";

  const shapeClasses = isIconOnly
    ? "p-0 border-0 rounded-none" // icon-only: no fixed square, SVG defines size
    : "rounded-full border border-border " + sizeClasses(size); // circular buttons

  const classes =
    baseCommon +
    " " +
    shapeClasses +
    " " +
    variantClasses(variant) +
    " " +
    (className ?? "");

  const iconClass = iconSizeClasses(size);

  const badge =
    badgeCount && badgeCount > 0 ? (
      <span
        className={
          "absolute -top-1 -right-1 inline-flex min-w-[1.1rem] h-[1.1rem] " +
          "items-center justify-center rounded-full bg-primary text-primary-foreground " +
          "text-[0.65rem] font-semibold shadow-sm px-[0.3rem]"
        }
      >
        {badgeCount}
      </span>
    ) : null;

  const content = (
    <>
      <SiteIcon name={icon} className={iconClass} />
      {badge}
    </>
  );

  // Link variant
  if ("href" in props) {
    const { href } = props as LinkProps;
    const linkRest = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  }

  // Button variant
  const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" className={classes} {...buttonRest}>
      {content}
    </button>
  );
}