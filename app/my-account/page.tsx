import Link from "next/link";
import { ArrowRight, Download, Home, MapPin, Package, UserRound } from "lucide-react";
import WordPressAccountStatus from "@/components/WordPressAccountStatus";
import { getWooAccountUrl, getWordPressBaseUrl } from "@/lib/wordpressUrl";

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

export default function MyAccountPage() {
  const wordpressBaseUrl = getWordPressBaseUrl();
  const accountUrl = getWooAccountUrl();

  return (
    <main className="page account-bridge-page">
      <p className="product-back-link">
        <Link href="/">← Back to store</Link>
      </p>

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
          const href = getWooAccountUrl(item.path) ?? "#";
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
    </main>
  );
}
