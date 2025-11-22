// components/blocks/HeroBlock.tsx

import Link from "next/link";
import { HeroLayoutBlock } from "../../lib/pageBuilder";

export default function HeroBlock({ block }: { block: HeroLayoutBlock }) {
  const btn = block.primaryButtonLink;

  return (
    <section className="pb-hero-block">
      <h2 className="pb-hero-title">Hero Section</h2>

      {btn && (
        <Link
          href={btn.url}
          target={btn.target || "_self"}
          className="pb-hero-button"
        >
          {btn.title}
        </Link>
      )}
    </section>
  );
}