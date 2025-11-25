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
  const data = await graphqlFetch<PageByUriResult>(`
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
          }
        }
      }
    }
  `);

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