"use client";

import type { ReactNode, MouseEvent } from "react";

type Props = {
  children: ReactNode;
};

function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  e.currentTarget.style.setProperty("--gradient-pct", `${x}%`);
}

function handleMouseLeave(e: MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.removeProperty("--gradient-pct");
}

export default function PrincityGradientTracker({ children }: Props) {
  return (
    <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  );
}
