// components/HomePerks.tsx
// Simple, static perks block for the home page.
// Uses shadcn <Badge> and Tailwind utilities, no hooks, no ACF.

import { Badge } from "@/components/ui/badge";

export type Perk = {
  id: string;
  label: string;
  title: string;
  body: string;
};

const PERKS: Perk[] = [
  {
    id: "support",
    label: "Support",
    title: "Real human, not a ticket bot",
    body: "Remote help for WordPress, WooCommerce and hosting. Clear explanations, not copy-paste answers.",
  },
  {
    id: "clean-ui",
    label: "Design",
    title: "Clean, minimal storefront",
    body: "React + Next.js front end that keeps focus on products, speed and clarity instead of clutter.",
  },
  {
    id: "flexible",
    label: "Flexibility",
    title: "Grows with each project",
    body: "Sections, grids and blocks we can re-use and extend for different clients, not a one-off theme.",
  },
];

function PerkCard({ perk }: { perk: Perk }) {
  return (
    <article
      className="home-perk-card rounded-2xl border bg-background/60 p-5 shadow-sm transition
                 hover:-translate-y-[1px] hover:shadow-md"
    >
      <Badge
        variant="outline"
        className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-wide"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {perk.label}
      </Badge>

      <h3 className="home-perk-title text-base font-semibold mb-1">
        {perk.title}
      </h3>

      <p className="home-perk-body text-sm leading-relaxed text-muted-foreground">
        {perk.body}
      </p>
    </article>
  );
}

export function HomePerksGrid({
  items,
  columnsDesktop = 3,
}: {
  items: Perk[];
  columnsDesktop?: 2 | 3 | 4;
}) {
  const gridCols =
    columnsDesktop === 2
      ? "md:grid-cols-2"
      : columnsDesktop === 4
      ? "md:grid-cols-4"
      : "md:grid-cols-3";

  return (
    <div className={`home-perks-grid grid gap-4 ${gridCols}`}>
      {items.map((perk) => (
        <PerkCard key={perk.id} perk={perk} />
      ))}
    </div>
  );
}

export default function HomePerks() {
  return (
    <section className="home-section home-perks">
      <div className="home-section-header mb-6">
        <div>
          <h2 className="home-section-title">Why this setup?</h2>
          <p className="home-section-subtitle">
            A small demo block, but built the “real” way – reusable, clean and easy to extend later.
          </p>
        </div>
      </div>

      <HomePerksGrid items={PERKS} columnsDesktop={3} />
    </section>
  );
}