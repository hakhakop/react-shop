// wc-store/app/[...slug]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPageByPath } from "../../lib/pages";
import Breadcrumbs from "../../components/Breadcrumbs";

type WPPageParams = {
  slug?: string[];
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
    // You can change "/" to "/category/all" or any other route later
    redirect("/");
  }

  const page = await getPageByPath(slugSegments);

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

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: page.title, href: page.uri || "" },
        ]}
      />

      <h1 className="page-title">{page.title}</h1>

      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
      />
    </main>
  );
}