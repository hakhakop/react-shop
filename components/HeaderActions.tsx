"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { useWishlist } from "./WishlistProvider";
import { useCart } from "./CartProvider";
import { useSearch } from "./SearchProvider";
import ThemeToggle from "./ThemeToggle";
import { SiteIconButton } from "@/components/ui/SiteIconButton";
import type { HeaderIconId } from "../lib/themeSettings";

type HeaderActionsProps = {
  icons?: HeaderIconId[];
  iconVariant?: "muted" | "ghost" | "solid" | "icon";
};

export default function HeaderActions({
  icons,
  iconVariant = "muted",
}: HeaderActionsProps) {
  const { totalCount: wishlistCount } = useWishlist();
  const { totalCount: cartCount, openMiniCart } = useCart();
  const { openSearch } = useSearch();

  const iconOrder: HeaderIconId[] =
    icons && icons.length
      ? icons
      : ["search", "wishlist", "cart", "account", "theme"];

  return (
    <div className="site-header-actions flex items-center gap-2">
      {iconOrder.map((id) => {
        switch (id) {
          case "wishlist":
            return (
              <motion.div
                key="wishlist"
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <SiteIconButton
                  icon="heart"
                  variant={iconVariant}
                  badgeCount={wishlistCount}
                  href="/wishlist"
                  size="md"
                  aria-label={
                    wishlistCount > 0
                      ? `Wishlist (${wishlistCount} items)`
                      : "Wishlist"
                  }
                />
              </motion.div>
            );

          case "cart":
            return (
              <motion.div
                key="cart"
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <SiteIconButton
                  icon="cart"
                  variant={iconVariant}
                  badgeCount={cartCount}
                  size="md"
                  aria-label={
                    cartCount > 0 ? `Cart (${cartCount} items)` : "Cart"
                  }
                  onClick={openMiniCart}
                />
              </motion.div>
            );

          case "account":
            return (
              <motion.div
                key="account"
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <SiteIconButton
                  icon="user"
                  variant={iconVariant}
                  href="/my-account"
                  size="md"
                  aria-label="My account"
                />
              </motion.div>
            );

          case "search":
            return (
              <motion.div
                key="search"
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <SiteIconButton
                  icon="search"
                  variant={iconVariant}
                  size="md"
                  aria-label="Search"
                  onClick={openSearch}
                />
              </motion.div>
            );

          case "theme":
            return (
              <motion.div
                key="theme"
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="ml-1"
              >
                <ThemeToggle variant={iconVariant} size="md" />
              </motion.div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}