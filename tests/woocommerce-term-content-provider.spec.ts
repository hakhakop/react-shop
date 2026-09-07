import { expect, test } from "@playwright/test";
import { resolveWooCommerceTermContexts } from "@/lib/woocommerceTermContentProvider.server";
import type { SaaSWebsite } from "@/lib/websites";

test("concurrent selected WooCommerce terms share one include request", async () => {
  const previous = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async input => {
    const url = String(input); urls.push(url);
    if (url.includes("products/tags?") && url.includes("include=")) return Response.json([
      { id: 71, name: "Women", slug: "women" },
      { id: 72, name: "Men", slug: "men" },
    ]);
    throw new Error(`Unexpected WooCommerce request: ${url}`);
  };
  const website = {
    id: "woo-term-batch",
    cmsConnection: {
      provider: "wordpress",
      siteUrl: "https://woo-term.example",
      wooCommerceApiUrl: "https://woo-term.example/wp-json/wc/v3",
      wooCommerceConsumerKey: "key",
      wooCommerceConsumerSecret: "secret",
    },
  } as SaaSWebsite;
  try {
    const [first, second] = await Promise.all([71, 72].map(id => resolveWooCommerceTermContexts({
      website,
      descriptor: { provider: "woocommerce", source: "product-tag", mode: "single", query: { id } },
    })));
    expect(first[0]?.fields.title?.value).toBe("Women");
    expect(second[0]?.fields.title?.value).toBe("Men");
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain("include=71%2C72");
  } finally { globalThis.fetch = previous; }
});

test("product-tag collections fetch the canonical intro image and hover video ACF URLs", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async input => {
    const url = String(input);
    if (url.includes("/products/tags?")) return Response.json([
      { id: 171, name: "Revolutionary Muse", slug: "revolutionary-muse" },
    ]);
    if (url.endsWith("/wp-json/wp/v2/taxonomies")) return Response.json({
      product_tag: { rest_base: "product_tag", rest_namespace: "wp/v2" },
    });
    if (url.includes("/wp-json/wp/v2/product_tag?")) return new Response("challenge", { status: 403 });
    if (url.includes("/wp-json/wp/v2/product_tag/171?")) return Response.json({
      id: 171,
      acf: {
        image_intro: { url: "https://woo-term.example/intro.jpg" },
        image_featured: { url: "https://woo-term.example/hover.mp4" },
      },
    });
    throw new Error(`Unexpected request: ${url}`);
  };
  const website = {
    id: "woo-term-media",
    cmsConnection: {
      provider: "wordpress",
      siteUrl: "https://woo-term.example",
      wooCommerceApiUrl: "https://woo-term.example/wp-json/wc/v3",
      wooCommerceConsumerKey: "key",
      wooCommerceConsumerSecret: "secret",
    },
  } as SaaSWebsite;
  try {
    const contexts = await resolveWooCommerceTermContexts({
      website,
      descriptor: {
        provider: "woocommerce",
        source: "product-tag",
        mode: "collection",
        query: {
          quantity: 10,
          requestedFields: ["acf.image_intro.url", "acf.image_featured.url"],
        },
      },
    });
    expect(contexts[0]?.fields["acf.image_intro.url"]?.value).toBe("https://woo-term.example/intro.jpg");
    expect(contexts[0]?.fields["acf.image_featured.url"]?.value).toBe("https://woo-term.example/hover.mp4");
  } finally { globalThis.fetch = previous; }
});

test("YOOtheme product-category collections preserve parent, empty, order, direction, and category links", async () => {
  const previous = globalThis.fetch;
  let requested = "";
  globalThis.fetch = async input => {
    requested = String(input);
    if (requested.includes("/products/categories?")) return Response.json([
      { id: 23, name: "Women", slug: "women" },
      { id: 43, name: "Men", slug: "men" },
    ]);
    throw new Error(`Unexpected request: ${requested}`);
  };
  const website = {
    id: "woo-category-filter",
    cmsConnection: {
      provider: "wordpress",
      siteUrl: "https://woo-term.example",
      wooCommerceApiUrl: "https://woo-term.example/wp-json/wc/v3",
      wooCommerceConsumerKey: "key",
      wooCommerceConsumerSecret: "secret",
    },
  } as SaaSWebsite;
  try {
    const contexts = await resolveWooCommerceTermContexts({
      website,
      descriptor: {
        provider: "woocommerce",
        source: "product-category",
        mode: "collection",
        query: {
          parentId: 0,
          start: 0,
          quantity: 10,
          order: "menuOrder",
          direction: "asc",
          hideEmpty: true,
        },
      },
    });
    const url = new URL(requested);
    expect(url.searchParams.get("parent")).toBe("0");
    expect(url.searchParams.get("hide_empty")).toBe("true");
    expect(url.searchParams.get("orderby")).toBe("id");
    expect(url.searchParams.get("order")).toBe("asc");
    expect(contexts.map(context => context.fields.link?.value)).toEqual([
      "/product-category/women",
      "/product-category/men",
    ]);
  } finally { globalThis.fetch = previous; }
});
