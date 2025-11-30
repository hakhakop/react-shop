"use client";

import * as React from "react";
import {
  Heart,
  ShoppingCart,
  User,
  Instagram,
  Facebook,
  X,
  SunMedium,
  MoonStar,
  Search,
} from "lucide-react";

const HeartFilled: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
             2 6 3.99 4 6.5 4
             8.24 4 9.91 4.81 11 6.08
             12.09 4.81 13.76 4 15.5 4
             18.01 4 20 6 20 8.5
             20 12.28 16.6 15.36 13.45 19.99
             12.88 20.73 12.46 21.35 12 21.35z" />
  </svg>
);

export type SiteIconName =
  | "heart"
  | "heart-filled"
  | "cart"
  | "user"
  | "instagram"
  | "facebook"
  | "x"
  | "sun"
  | "search"
  | "moon";

type SiteIconProps = {
  name: SiteIconName;
  className?: string;
};

const ICONS: Record<SiteIconName, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  heart: Heart,
  "heart-filled": HeartFilled,
  cart: ShoppingCart,
  user: User,
  instagram: Instagram,
  facebook: Facebook,
  x: X,
  sun: SunMedium,
  search: Search,
  moon: MoonStar,
};

export function SiteIcon({ name, className }: SiteIconProps) {
  const Icon = ICONS[name];

  if (!Icon) return null;

  return <Icon className={className ?? "h-4 w-4"} aria-hidden="true" />;
}