"use client";

import { cn } from "../lib/utils"; // if you have a cn helper, else remove
import React from "react";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
  className={`animate-pulse rounded-md bg-slate-800/50 ${className || ""}`}
  {...props}
/>
  );
}