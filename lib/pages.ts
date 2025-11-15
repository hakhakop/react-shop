// wc-store/lib/pages.ts
import { graphqlFetch } from "./graphql";

type WpPage = {
  id: string;
  title: string;
  slug: string;
  uri: string;
  content?: string | null;
};

type PageByPathResponse = {
  page?: WpPage | null;
};

const PAGE_BY_PATH_QUERY = `
  query PageByPath($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      title
      slug
      uri
      content
    }
  }
`;

/**
 * Resolve a WordPress page by its URI.
 *
 * Examples:
 *   []                -> "/"
 *   ["about"]         -> "/about/"
 *   ["info","terms"]  -> "/info/terms/"
 */
export async function getPageByPath(
  slugSegments: string[] | string | undefined
): Promise<WpPage | null> {
  const parts = Array.isArray(slugSegments)
    ? slugSegments
    : slugSegments
    ? [slugSegments]
    : [];

  // WordPress URIs usually include the leading and trailing slash.
  const uri = parts.length === 0 ? "/" : `/${parts.join("/")}/`;

  const data = await graphqlFetch<PageByPathResponse>(PAGE_BY_PATH_QUERY, {
    uri,
  });

  if (!data.page) {
    return null;
  }

  return data.page;
}