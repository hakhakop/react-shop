import { NextRequest, NextResponse } from "next/server";
import { getWordPressBaseUrl } from "@/lib/wordpressUrl";

type WordPressUser = {
  id?: number;
  name?: string;
  slug?: string;
  email?: string;
};

export async function GET(request: NextRequest) {
  const wordpressBaseUrl = getWordPressBaseUrl();

  if (!wordpressBaseUrl) {
    return NextResponse.json(
      {
        status: "unreadable",
        message:
          "WordPress URL is not configured. Add WORDPRESS_SITE_URL or WC_API_URL.",
      },
      { status: 500 }
    );
  }

  const cookie = request.headers.get("cookie") ?? "";

  if (!cookie) {
    return NextResponse.json({ status: "logged-out" });
  }

  try {
    const response = await fetch(`${wordpressBaseUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        Accept: "application/json",
        Cookie: cookie,
      },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json({ status: "logged-out" });
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "unreadable",
          message: `WordPress returned ${response.status} while checking the session.`,
        },
        { status: 502 }
      );
    }

    const user = (await response.json()) as WordPressUser;

    return NextResponse.json({
      status: "logged-in",
      user: {
        id: user.id,
        name: user.name || user.slug || "WordPress user",
        email: user.email,
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: "unreadable",
        message: "React could not reach WordPress to check the session.",
      },
      { status: 502 }
    );
  }
}
