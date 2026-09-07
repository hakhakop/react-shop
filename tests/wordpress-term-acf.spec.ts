import { expect, test } from "@playwright/test";
import { resolveWordPressTermAcf } from "@/lib/wordpressTermAcf.server";
import type { SaaSWebsite } from "@/lib/websites";

test("REST term fields resolve files and attachment IDs without projecting unrelated metadata", async () => {
  const previous = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async input => {
    const url = String(input); urls.push(url);
    const data = url.endsWith("taxonomies") ? { product_tag: { rest_base: "product_tag", rest_namespace: "wp/v2" } }
      : url.includes("/media/42") ? { source_url: "https://cms.example/image.jpg", alt_text: "Image" }
      : url.includes("/product_tag?") ? [{ id: 71, acf: { image_featured: { url: "https://cms.example/video.mp4" }, image_intro: 42, private_field: "Do not project" } }]
      : null;
    return new Response(JSON.stringify(data), { status: 200 });
  };
  try {
    const result = await resolveWordPressTermAcf({ website: { cmsConnection: { provider: "wordpress", siteUrl: "https://cms.example" } } as SaaSWebsite, taxonomy: "product_tag", ids: [71], requestedFields: ["acf.image_featured.url", "acf.image_intro.url", "acf.image_intro.alt"] });
    expect(result.get("71")).toEqual({
      "acf.image_featured.url": { type: "url", value: "https://cms.example/video.mp4" },
      "acf.image_intro.url": { type: "url", value: "https://cms.example/image.jpg" },
      "acf.image_intro.alt": { type: "string", value: "Image" },
    });
    expect(urls.filter(url => url.includes("/media/42"))).toHaveLength(1);
    expect(urls.filter(url => url.includes("/product_tag?") && url.includes("include=71"))).toHaveLength(1);
    expect(urls.some(url => url.includes("/product_tag/71"))).toBe(false);
    expect(urls.every(url => url.startsWith("https://cms.example/wp-json/"))).toBe(true);
  } finally { globalThis.fetch = previous; }
});

test("concurrent selected terms share one bounded REST collection request", async () => {
  const previous = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async input => {
    const url = String(input); urls.push(url);
    if (url.endsWith("taxonomies")) return Response.json({ product_tag: { rest_base: "product_tag", rest_namespace: "wp/v2" } });
    if (url.includes("/product_tag?")) return Response.json([
      { id: 71, acf: { image_featured: { url: "https://cms-batch.example/71.mp4" } } },
      { id: 72, acf: { image_featured: { url: "https://cms-batch.example/72.mp4" } } },
    ]);
    throw new Error(`Unexpected REST request: ${url}`);
  };
  const website = { id: "term-batch", cmsConnection: { provider: "wordpress", siteUrl: "https://cms-batch.example" } } as SaaSWebsite;
  try {
    const [first, second] = await Promise.all([
      resolveWordPressTermAcf({ website, taxonomy: "product_tag", ids: [71], requestedFields: ["acf.image_featured.url"] }),
      resolveWordPressTermAcf({ website, taxonomy: "product_tag", ids: [72], requestedFields: ["acf.image_featured.url"] }),
    ]);
    expect(first.get("71")?.["acf.image_featured.url"]?.value).toBe("https://cms-batch.example/71.mp4");
    expect(second.get("72")?.["acf.image_featured.url"]?.value).toBe("https://cms-batch.example/72.mp4");
    expect(urls.filter(url => url.endsWith("taxonomies"))).toHaveLength(1);
    expect(urls.filter(url => url.includes("/product_tag?"))).toHaveLength(1);
  } finally { globalThis.fetch = previous; }
});

test("Cloudflare-blocked collection route falls back to individual term routes", async () => {
  const previous = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async input => {
    const url = String(input); urls.push(url);
    if (url.endsWith("taxonomies")) return Response.json({ product_tag: { rest_base: "product_tag", rest_namespace: "wp/v2" } });
    if (url.includes("/product_tag?")) return new Response("<html>challenge</html>", { status: 403 });
    if (url.includes("/product_tag/71?")) return Response.json({ id: 71, acf: {
      image_intro: { url: "https://cms.example/intro.jpg" },
      image_featured: { url: "https://cms.example/hover.mp4" },
    } });
    throw new Error(`Unexpected REST request: ${url}`);
  };
  try {
    const result = await resolveWordPressTermAcf({
      website: { id: "cloudflare-fallback", cmsConnection: { provider: "wordpress", siteUrl: "https://cms.example" } } as SaaSWebsite,
      taxonomy: "product_tag",
      ids: [71],
      requestedFields: ["acf.image_intro.url", "acf.image_featured.url"],
    });
    expect(result.get("71")).toEqual({
      "acf.image_intro.url": { type: "url", value: "https://cms.example/intro.jpg" },
      "acf.image_featured.url": { type: "url", value: "https://cms.example/hover.mp4" },
    });
    expect(urls.some(url => url.includes("/product_tag?"))).toBe(true);
    expect(urls.some(url => url.includes("/product_tag/71?"))).toBe(true);
  } finally { globalThis.fetch = previous; }
});

test("saved Product Category aliases resolve YOOtheme's authored ACF media names", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async input => {
    const url = String(input);
    if (url.endsWith("taxonomies")) return Response.json({ product_cat: { rest_base: "product_cat", rest_namespace: "wp/v2" } });
    if (url.includes("/product_cat?")) return Response.json([{
      id: 23,
      acf: {
        products_intro_image: { url: "https://cms.example/women.jpg" },
        products_hover_video: { url: "https://cms.example/women.mp4" },
      },
    }]);
    throw new Error(`Unexpected REST request: ${url}`);
  };
  try {
    const result = await resolveWordPressTermAcf({
      website: { id: "product-category-aliases", cmsConnection: { provider: "wordpress", siteUrl: "https://cms.example" } } as SaaSWebsite,
      taxonomy: "product_cat",
      ids: [23],
      requestedFields: ["acf.image_intro.url", "acf.image_featured.url"],
    });
    expect(result.get("23")).toEqual({
      "acf.image_intro.url": { type: "url", value: "https://cms.example/women.jpg" },
      "acf.image_featured.url": { type: "url", value: "https://cms.example/women.mp4" },
    });
  } finally { globalThis.fetch = previous; }
});
