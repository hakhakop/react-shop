// components/layout/Container.tsx
import { ReactNode } from "react";
import clsx from "clsx";

type ContainerSize = "default" | "wide" | "narrow";

interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}

export function Container({
  children,
  size = "default",
  className,
}: ContainerProps) {
  return (
    <div
      className={clsx(
        "mx-auto px-4 sm:px-6 lg:px-8",
        size === "wide" && "max-w-7xl",
        size === "default" && "max-w-5xl",
        size === "narrow" && "max-w-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}