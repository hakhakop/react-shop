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
  options?: { endpoint?: string | null; headers?: Record<string, string> },
): Promise<T> {
  const endpoint = options?.endpoint || ENDPOINT;

  if (!endpoint) {
    throw new Error(
      "NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL is not set. Create .env.local for local development or .env.production for the server.",
    );
  }

  const endpoints = [endpoint];
  try {
    const parsed = new URL(endpoint);
    if (parsed.pathname.replace(/\/+$/, "") === "/graphql") {
      parsed.pathname = "/";
      parsed.search = "?graphql";
      const fallback = parsed.toString();
      if (fallback !== endpoint) endpoints.push(fallback);
    }
  } catch {
    // The configured endpoint will produce the canonical fetch diagnostic.
  }

  let res: Response | null = null;
  for (const candidate of endpoints) {
    res = await fetch(candidate, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 5 },
    });
    // Some WordPress stacks reserve `/graphql` but respond with a proxy/PHP
    // 5xx instead of a clean 404. When the canonical query-string endpoint is
    // available, let it answer before surfacing the transport failure.
    if (res.ok || candidate === endpoints[endpoints.length - 1]) break;
  }

  if (!res?.ok) {
    throw new Error(res
      ? `GraphQL request failed: ${res.status} ${res.statusText}`
      : "GraphQL request failed before receiving a response.");
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
