import { graphqlFetch } from "../../lib/graphql";
import PageRenderer from "../../components/PageRenderer";
import { mapPageBuilder } from "../../lib/pageBuilder";

type PageBuilderQueryResult = {
  page: {
    title: string;
    pageBuilderLayout: {
      pageBuilder: any[];
    } | null;
  } | null;
};

export default async function BuilderTestPage() {
  // TODO: replace "sample-page" with the real slug of your test page
  const data = await graphqlFetch<PageBuilderQueryResult>(`
    query BuilderTest {
      page(id: "sample-page", idType: URI) {
        title
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
            }
          }
        }
      }
    }
  `);

  const page = data.page;
  const blocks = mapPageBuilder(page?.pageBuilderLayout);

  return (
    <main className="home-page">
      <div className="home-inner">
        <h1 className="page-title">
          Builder test: {page?.title ?? "No page"}
        </h1>

        {blocks.length === 0 && (
          <p style={{ marginTop: 16, color: "#6b7280" }}>
            No blocks found in pageBuilderLayout.pageBuilder.
          </p>
        )}

        {/* This renders your blocks */}
        {/* HeroBlock + ProductGridBlock, based on __typename */}
        <PageRenderer blocks={blocks} />
      </div>
    </main>
  );
}