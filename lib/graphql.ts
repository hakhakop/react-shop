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
      "NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL is not set. Create .env.local for local development or .env.production for the server."
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
    // Server Component can revalidate, but this is optional
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

function normalizeGraphQLBaseUrl(value: string) {
  const text = value.trim();
  if (!text) return null;
  const url = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  return url.replace(/\/+$/, "");
}

export function safeDecodeURI(value: string): string {
  if (/%[0-9a-fA-F]{2}/.test(value)) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return value;
}

export function getWebsiteGraphQLEndpoint(website?: {
  type?: string;
  ecommerceSettings?: {
    wordpressGraphqlUrl?: string;
  };
} | null) {
  if (website?.type !== "e-commerce") return null;

  return normalizeGraphQLBaseUrl(
    website.ecommerceSettings?.wordpressGraphqlUrl ?? "",
  );
}
