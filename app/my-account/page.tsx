import { ArrowRight, Download, Home, MapPin, Package, UserRound } from "lucide-react";
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import WordPressAccountStatus from "@/components/WordPressAccountStatus";
import { renderDomainWebsiteFrontend } from "@/components/website/DomainWebsiteFrontend";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";
import { getCurrentWebsiteFromHeaders } from "@/lib/currentWebsite";
import {
  getWooAccountUrl,
  getWooCommerceConnection,
  type WooCommerceConnection,
} from "@/lib/woocommerce";

const accountLinks = [
  {
    label: "Login / Register",
    description: "Use the WooCommerce customer account screen.",
    path: "",
    icon: UserRound,
  },
  {
    label: "Orders",
    description: "View current and previous WooCommerce orders.",
    path: "orders/",
    icon: Package,
  },
  {
    label: "Addresses",
    description: "Manage billing and shipping addresses in WooCommerce.",
    path: "edit-address/",
    icon: MapPin,
  },
  {
    label: "Downloads",
    description: "Access downloadable products when a store uses them.",
    path: "downloads/",
    icon: Download,
  },
];

function MyAccountPageContent({
  connection,
}: {
  connection: WooCommerceConnection;
}) {
  const wordpressBaseUrl = connection.wordpressBaseUrl;
  const accountUrl = getWooAccountUrl(connection);

  return (
    <>
      <section className="account-bridge-hero">
        <div>
          <span className="account-bridge-kicker">WordPress account</span>
          <h1 className="page-title">My account</h1>
          <p className="page-subtitle">
            Customer login, registration, orders, addresses, and downloads stay
            inside WooCommerce so the React storefront and WordPress share one
            user system.
          </p>
        </div>
        {accountUrl && (
          <a className="btn btn-primary account-bridge-primary" href={accountUrl}>
            Open WooCommerce account
            <ArrowRight size={16} />
          </a>
        )}
      </section>

      {!wordpressBaseUrl && (
        <div className="account-bridge-warning">
          Add <code>WORDPRESS_SITE_URL</code> or <code>WC_API_URL</code> in the
          environment to connect this page to the WooCommerce account area.
        </div>
      )}

      <WordPressAccountStatus
        wordpressBaseUrl={wordpressBaseUrl}
        accountUrl={accountUrl}
      />

      <div className="account-bridge-grid">
        {accountLinks.map((item) => {
          const href = getWooAccountUrl(connection, item.path) ?? "#";
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              className={`account-bridge-card${href === "#" ? " is-disabled" : ""}`}
              href={href}
              aria-disabled={href === "#" ? "true" : undefined}
            >
              <span className="account-bridge-icon">
                <Icon size={20} />
              </span>
              <strong>{item.label}</strong>
              <span>{item.description}</span>
              <em>
                Continue
                <ArrowRight size={14} />
              </em>
            </a>
          );
        })}
      </div>

      {wordpressBaseUrl && (
        <div className="account-bridge-note">
          <Home size={16} />
          <span>
            Connected WordPress site: <strong>{wordpressBaseUrl}</strong>
          </span>
        </div>
      )}
    </>
  );
}

export default async function MyAccountPage() {
  const website = await getCurrentWebsiteFromHeaders();
  const connection = getWooCommerceConnection(website);
  const content = <MyAccountPageContent connection={connection} />;
  const domainWebsitePage = await renderDomainWebsiteFrontend({
    requestedPage: "my-account",
    rendererProps: {
      pageContent: content,
    },
    fallbackContent: <main className="page account-bridge-page">{content}</main>,
  });

  if (domainWebsitePage) return domainWebsitePage;

  const layout = await getPublishedBuilderLayout("page:my-account");

  if (layout) {
    return (
      <StorefrontBuilderRenderer
        layout={layout}
        page="page:my-account"
        pageLabel="My account"
        pageContent={content}
      />
    );
  }

  return <main className="page account-bridge-page">{content}</main>;
}
