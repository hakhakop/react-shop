import { NextRequest, NextResponse } from "next/server";
import { getWordPressBaseUrl } from "@/lib/wordpressUrl";

type FluentFormResponse = {
  html?: string;
  scripts?: string[];
  styles?: string[];
};

export async function GET(request: NextRequest) {
  const formId = request.nextUrl.searchParams.get("formId")?.trim();
  const wordpressBaseUrl = getWordPressBaseUrl();

  if (!wordpressBaseUrl) {
    return NextResponse.json(
      {
        message:
          "WordPress URL is not configured. Add WORDPRESS_SITE_URL or WC_API_URL.",
      },
      { status: 500 }
    );
  }

  if (!formId || !/^\d+$/.test(formId)) {
    return NextResponse.json(
      { message: "A numeric Fluent Forms formId is required." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${wordpressBaseUrl}/wp-json/react-shop/v1/fluent-form/${formId}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    );

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? ((await response.json()) as FluentFormResponse & { message?: string })
      : null;

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            payload?.message ??
            `WordPress returned ${response.status} while rendering Fluent Form ${formId}.`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      html: payload?.html ?? "",
      scripts: Array.isArray(payload?.scripts) ? payload.scripts : [],
      styles: Array.isArray(payload?.styles) ? payload.styles : [],
    });
  } catch {
    return NextResponse.json(
      { message: "React could not reach WordPress to render the Fluent Form." },
      { status: 502 }
    );
  }
}
