export default function WebsiteBuilderLoading() {
  return (
    <div className="builder-route-loading" role="status" aria-live="polite" aria-label="Loading website builder">
      <aside className="builder-route-loading-sidebar" aria-hidden="true">
        <span className="builder-route-loading-brand" />
        <span className="builder-route-loading-line is-wide" />
        <span className="builder-route-loading-line" />
        <span className="builder-route-loading-line is-short" />
        <span className="builder-route-loading-card" />
        <span className="builder-route-loading-card" />
      </aside>
      <main className="builder-route-loading-canvas">
        <span className="builder-canvas-loading-spinner" aria-hidden="true" />
        <span>Loading builder…</span>
      </main>
    </div>
  );
}
