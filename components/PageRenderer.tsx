// components/PageRenderer.tsx

import {
  PageBuilderBlock,
  HeroLayoutBlock,
  ProductGridLayoutBlock,
} from "../lib/pageBuilder";

import HeroBlock from "./blocks/HeroBlock";
import ProductGridBlock from "./blocks/ProductGridBlock";

export default async function PageRenderer({
  blocks,
}: {
  blocks: PageBuilderBlock[];
}) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.__typename) {
          case "PageBuilderLayoutPageBuilderHeroLayout":
            return <HeroBlock key={i} block={block as HeroLayoutBlock} />;

          case "PageBuilderLayoutPageBuilderProductGridLayout":
            return (
              <ProductGridBlock
                key={i}
                block={block as ProductGridLayoutBlock}
              />
            );

          default:
            return (
              <div key={i} style={{ padding: 20, opacity: 0.4 }}>
                Unknown block: {(block as PageBuilderBlock).__typename}
              </div>
            );
        }
      })}
    </>
  );
}