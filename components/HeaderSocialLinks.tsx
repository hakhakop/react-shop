"use client";

import { WebPagesIcon } from "@/components/builder/WebPagesIcon";

function platform(link: string) {
  const value = link.toLowerCase();
  if (value.includes("500px")) return "500px";
  if (value.includes("instagram")) return "instagram";
  if (value.includes("facebook")) return "facebook";
  if (value.includes("linkedin")) return "linkedin";
  if (value.includes("youtube")) return "youtube";
  if (value.includes("twitter") || value.includes("x.com")) return "twitter";
  return "world";
}

export default function HeaderSocialLinks({ items, buttonStyle = false, gap = "" }: { items: Array<{ link: string }>; buttonStyle?: boolean; gap?: string }) {
  return (
    <div className={`site-header-social site-header-social--gap-${gap || "default"}`}>
      {items.map(({ link }) => {
        const icon = platform(link);
        return (
          <a key={link} href={link} target="_blank" rel="noreferrer" className={buttonStyle ? "uk-icon-button" : "uk-icon-link"} aria-label={icon}>
            <WebPagesIcon name={icon} size={20} />
          </a>
        );
      })}
    </div>
  );
}
