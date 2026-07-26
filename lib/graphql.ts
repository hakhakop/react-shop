import { getCmsConnection } from "@/lib/cmsConnection";
import type { SaaSWebsite } from "@/lib/websites";

const ENDPOINT = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;

type GraphQLError = { message: string };

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export async function graphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { endpoint?: string | null },
): Promise<T> {
  const endpoint = options?.endpoint || ENDPOINT;

  if (!endpoint) {
    throw new Error(
      "NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL is not set. Create .env.local for local development or .env.production for the server.",
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: { revalidate: 5 },
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
  }

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error("GraphQL response has no data");
  }

  return json.data;
}

import { safeDecodeURI } from "@/lib/safeDecodeURI";
export { safeDecodeURI };

export function getWebsiteGraphQLEndpoint(
  website?: SaaSWebsite | null,
): string | null {
  const cms = getCmsConnection(website);
  return cms.graphqlUrl || null;
}
