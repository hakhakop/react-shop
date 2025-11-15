// wc-store/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import {
  getProductCategories,
  ProductCategory,
} from "../lib/navigation";
import { CartProvider } from "../components/CartProvider";
import { ToastProvider } from "../components/ToastProvider";
import { ThemeProvider } from "../components/ThemeProvider";
import { WishlistProvider } from "../components/WishlistProvider";
import HeaderShell from "../components/HeaderShell";

export const metadata: Metadata = {
  title: "Webpages Store",
  description:
    "Headless WooCommerce store powered by WordPress + GraphQL + Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We still load categories here for the category bar under the header
  const categories: ProductCategory[] = await getProductCategories();

  return (
    <html lang="en">
      <body className="body-root">
        <ThemeProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                {/* Dynamic header controlled by Theme Settings (header_layout) */}
                <HeaderShell />

                {/* Category bar under the header */}
                {categories.length > 0 && (
                  <div className="category-bar">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="category-pill"
                      >
                        {cat.name}
                        {cat.count > 0 && (
                          <span className="category-pill-count">
                            {cat.count}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Main content */}
                <main className="site-main">{children}</main>

                {/* Footer */}
                <footer className="site-footer">
                  <div className="site-footer-inner">
                    <span>
                      © 2025 Webpages · Headless WooCommerce demo
                    </span>
                    <span>
                      Powered by{" "}
                      <span className="site-footer-strong">
                        WordPress · WooCommerce · WPGraphQL · Next.js
                      </span>
                    </span>
                  </div>
                </footer>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}