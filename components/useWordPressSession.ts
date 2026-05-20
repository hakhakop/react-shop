"use client";

import { useCallback, useEffect, useState } from "react";

export type WordPressSessionState =
  | { status: "checking" }
  | { status: "logged-in"; id?: number; name: string; email?: string }
  | { status: "logged-out" }
  | { status: "unreadable"; message: string };

type WordPressSessionResponse = {
  status?: string;
  user?: {
    id?: number;
    name?: string;
    slug?: string;
    email?: string;
  };
  message?: string;
};

export function useWordPressSession(wordpressBaseUrl?: string | null) {
  const [session, setSession] = useState<WordPressSessionState>({
    status: "checking",
  });

  const checkSession = useCallback(async () => {
    if (!wordpressBaseUrl) {
      setSession({
        status: "unreadable",
        message: "WordPress URL is not configured yet.",
      });
      return;
    }

    setSession({ status: "checking" });

    try {
      const sessionUrl = `${wordpressBaseUrl.replace(
        /\/$/,
        ""
      )}/wp-admin/admin-ajax.php?action=react_shop_session`;
      const response = await fetch(sessionUrl, {
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`WordPress returned ${response.status}.`);
      }

      const result = (await response.json()) as WordPressSessionResponse;

      if (result.status === "logged-in") {
        const user = result.user;
        setSession({
          status: "logged-in",
          id: user?.id,
          name: user?.name || user?.slug || "WordPress user",
          email: user?.email,
        });
        return;
      }

      if (result.status === "unreadable") {
        setSession({
          status: "unreadable",
          message:
            result.message ||
            "React cannot read the WordPress browser session yet.",
        });
        return;
      }

      setSession({ status: "logged-out" });
    } catch {
      setSession({
        status: "unreadable",
        message:
          "React cannot read the WordPress session yet. Add the React Shop admin-ajax session snippet in WordPress and allow this React domain.",
      });
    }
  }, [wordpressBaseUrl]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return { session, checkSession };
}
