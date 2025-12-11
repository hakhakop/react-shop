// wc-store/app/[...slug]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { graphqlFetch } from "../../lib/graphql";
import Breadcrumbs from "../../components/Breadcrumbs";
import PageRenderer from "../../components/PageRenderer";
import { mapPageBuilder } from "../../lib/pageBuilder";

type WPPageParams = {
  slug?: string[];
};

type PageByUriResult = {
  pageBy: {
    title: string;
    uri?: string | null;
    content?: string | null;
    pageBuilderLayout?: {
      pageBuilder?: any[] | null;
    } | null;
  } | null;
};

export default async function WPPage({
  params,
}: {
  params: Promise<WPPageParams>;
}) {
  // Next 16: params is a Promise → we must await it
  const resolved = await params;
  const slugSegments = resolved.slug;

  // Special-case: /shop → redirect to main store (home)
  if (
    slugSegments &&
    Array.isArray(slugSegments) &&
    slugSegments.length === 1 &&
    slugSegments[0] === "shop"
  ) {
    redirect("/");
  }

  // Build WordPress URI from slug segments, e.g. ["about"] → "/about/"
  const uri =
    !slugSegments || slugSegments.length === 0
      ? "/"
      : `/${slugSegments.join("/")}/`;

  // Fetch page by URI from WordPress via GraphQL
  let data: PageByUriResult;

  try {
    // Preferred query: assumes ACF-based section settings are exposed to WPGraphQL
    data = await graphqlFetch<PageByUriResult>(`
      query {
        pageBy(uri: "${uri}") {
          title
          uri
          content
          pageBuilderLayout {
            pageBuilder {
              __typename
              fieldGroupName

              ... on PageBuilderLayoutPageBuilderHeroLayout {
                sectionBackground
                sectionTopSpacing
                sectionBottomSpacing

                primaryButtonLink {
                  url
                  title
                  target
                }
              }

              ... on PageBuilderLayoutPageBuilderProductGridLayout {
                sectionSettings {
                  sectionBackground
                  sectionTopSpacing
                  sectionBottomSpacing
                }

                cardPreset
                gridLimit
                source
                layoutVariant
                category {
                  nodes {
                    databaseId
                    name
                    slug
                  }
                }
              }

              ... on PageBuilderLayoutPageBuilderPromoStripLayout {
                sectionBackground
                sectionTopSpacing
                sectionBottomSpacing

                psText
                psSubtext
                psCtaLabel
                psCtaUrl
                psVariant
              }

              ... on PageBuilderLayoutPageBuilderBadgeGridLayoutLayout {
                bgColumnsDesktop: columnsOnDesktop
                bgItems: bgitems {
                  bgId: bgid
                  bgLabel: bglabel
                  bgTitle: bgtitle
                  bgBody: bgbody
                }
              }

              ... on PageBuilderLayoutPageBuilderCarouselLayoutLayout {
                sectionSettings {
                  sectionBackground
                  sectionTopSpacing
                  sectionBottomSpacing
                }

                carouselSettings: carouselsettings {
                  variant
                  loop
                  autoplay
                  autoplayDelayMs
                  align
                  dragFree
                }

                slides {
                  slideId
                  title
                  subtitle
                  text
                  buttonLabel
                  buttonUrl
                  badge
                }
              }
            }
          }
        }
      }
    `);
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);

    // Fallback: if ACF section fields are not present in the schema yet,
    // re-run a simpler query without sectionBackground/sectionTopSpacing/sectionBottomSpacing.
    if (
      message.includes('Cannot query field "sectionBackground"') ||
      message.includes("sectionTopSpacing") ||
      message.includes("sectionBottomSpacing")
    ) {
      data = await graphqlFetch<PageByUriResult>(`
        query {
          pageBy(uri: "${uri}") {
            title
            uri
            content
            pageBuilderLayout {
              pageBuilder {
                __typename
                fieldGroupName

                ... on PageBuilderLayoutPageBuilderHeroLayout {
                  primaryButtonLink {
                    url
                    title
                    target
                  }
                }

                ... on PageBuilderLayoutPageBuilderProductGridLayout {
                  sectionSettings {
                    sectionBackground
                    sectionTopSpacing
                    sectionBottomSpacing
                  }

                  cardPreset
                  gridLimit
                  source
                  layoutVariant
                  category {
                    nodes {
                      databaseId
                      name
                      slug
                    }
                  }
                }

                ... on PageBuilderLayoutPageBuilderPromoStripLayout {
                  psText
                  psSubtext
                  psCtaLabel
                  psCtaUrl
                  psVariant
                }

                ... on PageBuilderLayoutPageBuilderBadgeGridLayoutLayout {
                  bgColumnsDesktop: columnsOnDesktop
                  bgItems: bgitems {
                    bgId: bgid
                    bgLabel: bglabel
                    bgTitle: bgtitle
                    bgBody: bgbody
                  }
                }

              ... on PageBuilderLayoutPageBuilderCarouselLayoutLayout {
                sectionSettings {
                  sectionBackground
                  sectionTopSpacing
                  sectionBottomSpacing
                }

                carouselSettings: carouselsettings {
                  variant
                  loop
                  autoplay
                  autoplayDelayMs
                  align
                  dragFree
                }

                slides {
                  slideId
                  image {
                    node {
                      sourceUrl
                      altText
                    }
                  }
                  title
                  subtitle
                  text
                  buttonLabel
                  buttonUrl
                  badge
                }
              }
              }
            }
          }
        }
      `);
    } else {
      // If it's some other GraphQL error, rethrow so we see it.
      throw error;
    }
  }

  const page = data.pageBy;

  if (!page) {
    return (
      <main className="page">
        <h1 className="page-title">Page not found</h1>
        <p className="page-subtitle">
          We couldn&apos;t find this page in WordPress.
        </p>
        <Link href="/" className="home-section-link">
          ← Back to store
        </Link>
      </main>
    );
  }

  const blocks = mapPageBuilder(page.pageBuilderLayout);

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: page.title, href: page.uri || uri },
        ]}
      />

      <h1 className="page-title">{page.title}</h1>

      {blocks.length > 0 ? (
        <PageRenderer blocks={blocks} />
      ) : (
        <article
          className="prose"
          dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
        />
      )}
    </main>
  );
}