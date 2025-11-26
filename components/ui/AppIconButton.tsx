"use client";

import * as React from "react";
import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui/button";

type IconSize = "sm" | "md" | "lg";
type IconVariant = "subtle" | "solid" | "ghost";

type AppIconButtonProps = {
  icon: React.ReactNode;
  badgeCount?: number;
  href?: string;
  size?: IconSize;
  variant?: IconVariant;
} & Omit<ButtonProps, "children" | "variant" | "size">;

// map size → classes
const sizeClasses: Record<IconSize, string> = {
  sm: "h-7 w-7 text-[0.9rem]",
  md: "h-8 w-8 text-[1rem]",
  lg: "h-9 w-9 text-[1.1rem]",
};

// map variant → classes
const variantClasses: Record<IconVariant, string> = {
  subtle:
    "border border-border bg-background text-foreground hover:bg-muted",
  solid:
    "border border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
  ghost:
    "border border-transparent bg-transparent hover:bg-muted/60",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full shadow-sm " +
  "transition-transform transition-colors hover:-translate-y-px hover:shadow-md " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50";

const iconClass = "inline-flex items-center justify-center leading-none";

const badgeClass =
  "ml-1 inline-flex min-w-[1rem] h-[1rem] items-center justify-center " +
  "rounded-full bg-primary text-primary-foreground text-[0.6rem] " +
  "font-semibold shadow-sm px-[0.3rem]";

export function AppIconButton({
  icon,
  badgeCount,
  href,
  size = "md",
  variant = "subtle",
  className,
  ...props
}: AppIconButtonProps) {
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];

  const content = (
    <>
      <span className={`${iconClass}`}>{icon}</span>
      {badgeCount && badgeCount > 0 && (
        <span className={badgeClass}>{badgeCount}</span>
      )}
    </>
  );

  const buttonClasses = `${baseClasses} ${sizeClass} ${variantClass} ${
    className ?? ""
  }`;

  if (href) {
    return (
      <Button
        asChild
        type="button"
        variant="ghost"
        size="icon"
        className={buttonClasses}
        {...props}
      >
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={buttonClasses}
      {...props}
    >
      {content}
    </Button>
  );
}