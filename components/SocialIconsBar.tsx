// components/SocialIconsBar.tsx
"use client";

import { AppIconButton } from "@/components/ui/AppIconButton";
// you can replace these with lucide icons, SVGs, or emojis
function InstagramIcon() {
  return <span>📸</span>;
}
function FacebookIcon() {
  return <span>📘</span>;
}
function XIcon() {
  return <span>𝕏</span>;
}

const socials = [
  { id: "instagram", icon: <InstagramIcon />, href: "https://instagram.com/yourbrand" },
  { id: "facebook", icon: <FacebookIcon />, href: "https://facebook.com/yourbrand" },
  { id: "x", icon: <XIcon />, href: "https://x.com/yourbrand" },
];

export default function SocialIconsBar() {
  return (
    <div className="flex items-center gap-2">
      {socials.map((s) => (
        <AppIconButton
          key={s.id}
          icon={s.icon}
          href={s.href}
          size="sm"
          variant="ghost"
          aria-label={s.id}
        />
      ))}
    </div>
  );
}