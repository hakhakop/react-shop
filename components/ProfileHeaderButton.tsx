// components/ProfileHeaderButton.tsx
"use client";

import { AppIconButton } from "@/components/ui/AppIconButton";

function ProfileIcon() {
  return <span>👤</span>; // later: proper SVG
}

export default function ProfileHeaderButton() {
  return (
    <AppIconButton
      icon={<ProfileIcon />}
      href="/my-account"
      size="md"
      variant="ghost"
      aria-label="My account"
/>
  );
}