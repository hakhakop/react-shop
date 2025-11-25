"use client";

import * as React from "react";
import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui/button";

type AppIconButtonProps = {
  icon: React.ReactNode;
  badgeCount?: number;
  href?: string;
} & Omit<ButtonProps, "children" | "variant" | "size">;

const baseClasses =
  "inline-flex h-9 w-9 items-center justify-center rounded-full " +
  "border border-border bg-background text-foreground shadow-sm " +
  "transition hover:bg-muted hover:-translate-y-px hover:shadow-md " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "dark:shadow-[0_0_0_1px_rgba(148,163,184,0.45)]";

const iconClass =
  "inline-flex items-center justify-center text-[1.1rem] leading-none";

const badgeClass =
  "ml-1 inline-flex min-w-[1rem] h-[1rem] items-center justify-center " +
  "rounded-full bg-primary text-primary-foreground text-[0.6rem] " +
  "font-semibold shadow-sm px-[0.3rem]";

export function AppIconButton({
  icon,
  badgeCount,
  href,
  className,
  ...props
}: AppIconButtonProps) {
  const content = (
    <>
      <span className={iconClass}>{icon}</span>
      {badgeCount && badgeCount > 0 && (
        <span className={badgeClass}>{badgeCount}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Button
        asChild
        type="button"
        variant="ghost"
        size="icon"
        className={`${baseClasses} ${className ?? ""}`}
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
      className={`${baseClasses} ${className ?? ""}`}
      {...props}
    >
      {content}
    </Button>
  );
}