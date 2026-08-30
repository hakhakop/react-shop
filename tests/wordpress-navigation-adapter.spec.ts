import { expect, test } from "@playwright/test";
import { retrieveWordPressNavigationPackages } from "@/lib/wordpressNavigation.server";

test("the explicit WordPress adapter produces a detached WebPages package snapshot", async () => {
  const originalFetch = global.fetch;
  let requests = 0;
  global.fetch = (async () => {
    requests += 1;
    return new Response(JSON.stringify({
      data: {
        menus: {
          nodes: [{
            databaseId: 7,
            name: "Primary",
            slug: "primary",
            locations: ["NAVBAR"],
            menuItems: {
              nodes: [
                {
                  databaseId: 11,
                  parentDatabaseId: null,
                  label: "About",
                  url: "https://source.example/about/",
                  path: "/about/",
                  connectedNode: { node: { __typename: "Page", databaseId: 101, uri: "/about/" } },
                },
                {
                  databaseId: 12,
                  parentDatabaseId: 11,
                  label: "News",
                  url: "https://source.example/category/news/",
                  path: "/category/news/",
                  connectedNode: { node: { __typename: "Category", databaseId: 102, uri: "/category/news/" } },
                },
                {
                  databaseId: 13,
                  parentDatabaseId: null,
                  label: "External",
                  url: "https://external.example/path",
                  path: "https://external.example/path",
                  target: "_blank",
                  connectedNode: null,
                },
              ],
            },
          }],
        },
      },
    }), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;

  try {
    const packages = await retrieveWordPressNavigationPackages({
      cmsConnection: {
        provider: "wordpress",
        siteUrl: "https://source.example",
        graphqlUrl: "https://source.example/graphql",
        adminUrl: "",
        wooCommerceApiUrl: "",
        wooCommerceConsumerKey: "",
        wooCommerceConsumerSecret: "",
        wordpressUsername: "",
        wordpressApplicationPassword: "",
        storeStatusNotes: "",
        technicalNotes: "",
        updatedAt: "",
      },
    } as never);
    const packageValue = packages[0];

    expect(requests).toBe(1);
    expect(packageValue.menu.name).toBe("Primary");
    expect(packageValue.menu.intendedLocation).toBe("NAVBAR");
    expect(packageValue.menu.items.map((item) => item.target.kind)).toEqual(["page", "term", "custom"]);
    expect(packageValue.menu.items[1].target.taxonomy).toBe("category");
    expect(packageValue.menu.items[1].parentKey).toBe(packageValue.menu.items[0].key);
    expect(packageValue.menu.items[0].target.uri).toBe("/about/");
    expect(packageValue.menu.items[2].target.url).toBe("https://external.example/path");
  } finally {
    global.fetch = originalFetch;
  }
});

test("assigned WordPress pages become canonical system targets without changing their authored URI", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async (input) => {
    const url = String(input);
    if (url.endsWith("/graphql")) {
      return new Response(JSON.stringify({ data: { menus: { nodes: [{
        databaseId: 9,
        name: "Main Menu",
        locations: ["NAVBAR"],
        menuItems: { nodes: [
          { databaseId: 1, label: "New In", path: "/new-in/", connectedNode: { node: { __typename: "Page", databaseId: 1416, uri: "/new-in/" } } },
          { databaseId: 2, label: "Basket", path: "/basket/", connectedNode: { node: { __typename: "Page", databaseId: 471, uri: "/basket/" } } },
          { databaseId: 3, label: "About", path: "/about/", connectedNode: { node: { __typename: "Page", databaseId: 4, uri: "/about/" } } },
        ] },
      }] } } }), { headers: { "content-type": "application/json" } });
    }
    if (url.endsWith("/wp-json/wp/v2/settings")) {
      return new Response(JSON.stringify({ page_on_front: 1, page_for_posts: 1501 }), { headers: { "content-type": "application/json" } });
    }
    const settingId = url.split("/").at(-1);
    const values: Record<string, string> = {
      woocommerce_shop_page_id: "1416",
      woocommerce_cart_page_id: "471",
      woocommerce_checkout_page_id: "472",
      woocommerce_myaccount_page_id: "473",
    };
    return new Response(JSON.stringify({ id: settingId, value: values[settingId ?? ""] }), { headers: { "content-type": "application/json" } });
  }) as typeof fetch;

  try {
    const [packageValue] = await retrieveWordPressNavigationPackages({
      cmsConnection: {
        provider: "wordpress",
        siteUrl: "https://source.example",
        graphqlUrl: "https://source.example/graphql",
        adminUrl: "",
        wooCommerceApiUrl: "https://source.example/wp-json/wc/v3",
        wooCommerceConsumerKey: "server-key",
        wooCommerceConsumerSecret: "server-secret",
        wordpressUsername: "server-user",
        wordpressApplicationPassword: "server-password",
        storeStatusNotes: "",
        technicalNotes: "",
        updatedAt: "",
      },
    } as never);

    const [shop, cart, ordinaryPage] = packageValue.menu.items;
    expect(shop.target).toEqual({
      kind: "system",
      pageKey: "shop",
      sourceDatabaseId: 1416,
      uri: "/new-in/",
    });
    expect(cart.target).toMatchObject({ kind: "system", pageKey: "cart", uri: "/basket/" });
    expect(ordinaryPage.target).toMatchObject({ kind: "page", postType: "page", slug: "about" });
  } finally {
    global.fetch = originalFetch;
  }
});

test("explicit import verifies WooCommerce category and product targets through server credentials", async () => {
  const originalFetch = global.fetch;
  const requestedUrls: string[] = [];
  global.fetch = (async (input) => {
    const url = String(input);
    requestedUrls.push(url);
    if (url.endsWith("/graphql")) {
      return new Response(JSON.stringify({ data: { menus: { nodes: [{
        databaseId: 10,
        name: "Commerce",
        locations: ["NAVBAR"],
        menuItems: { nodes: [
          { databaseId: 21, label: "Clothing", path: "/product-category/women/clothing/", connectedNode: { node: { __typename: "ProductCategory", databaseId: 999, uri: "/product-category/women/clothing/" } } },
          { databaseId: 22, label: "Blouse", path: "/product/black-oversized-blouse/", connectedNode: { node: { __typename: "Product", databaseId: 998, uri: "/product/black-oversized-blouse/" } } },
        ] },
      }] } } }), { headers: { "content-type": "application/json" } });
    }
    if (url.includes("products/categories?slug=clothing")) {
      return new Response(JSON.stringify([{ id: 24, slug: "clothing" }]), { headers: { "content-type": "application/json" } });
    }
    if (url.includes("products?slug=black-oversized-blouse")) {
      return new Response(JSON.stringify([{ id: 187, slug: "black-oversized-blouse" }]), { headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({ id: url.split("/").at(-1), value: "0" }), { headers: { "content-type": "application/json" } });
  }) as typeof fetch;

  try {
    const [packageValue] = await retrieveWordPressNavigationPackages({
      cmsConnection: {
        provider: "wordpress",
        siteUrl: "https://source.example",
        graphqlUrl: "https://source.example/graphql",
        adminUrl: "",
        wooCommerceApiUrl: "https://source.example/wp-json/wc/v3",
        wooCommerceConsumerKey: "server-key",
        wooCommerceConsumerSecret: "server-secret",
        wordpressUsername: "",
        wordpressApplicationPassword: "",
        storeStatusNotes: "",
        technicalNotes: "",
        updatedAt: "",
      },
    } as never);

    expect(packageValue.menu.items[0].target).toEqual({
      kind: "term",
      taxonomy: "product_cat",
      slug: "clothing",
      uri: "/product-category/women/clothing/",
      sourceDatabaseId: 24,
    });
    expect(packageValue.menu.items[1].target).toEqual({
      kind: "product",
      postType: "product",
      slug: "black-oversized-blouse",
      uri: "/product/black-oversized-blouse/",
      sourceDatabaseId: 187,
    });
    expect(requestedUrls.some((url) => url.includes("/wp-json/wc/v3/products/categories"))).toBe(true);
  } finally {
    global.fetch = originalFetch;
  }
});
