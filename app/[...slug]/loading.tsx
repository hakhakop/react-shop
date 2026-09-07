import StorefrontRouteLoadingSkeleton from "../../components/StorefrontRouteLoadingSkeleton";

export default function StorefrontLoading() {
  return (
    <main className="storefront-route-loading" aria-label="Loading page" aria-busy="true">
      <StorefrontRouteLoadingSkeleton />
    </main>
  );
}
