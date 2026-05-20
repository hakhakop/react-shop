import { NextRequest, NextResponse } from "next/server";
import { getWordPressBaseUrl } from "@/lib/wordpressUrl";

type FluentFormSubmitRequest = {
  formId?: string | number;
  data?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
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

  let body: FluentFormSubmitRequest;

  try {
    body = (await request.json()) as FluentFormSubmitRequest;
  } catch {
    return NextResponse.json(
      { message: "A JSON request body is required." },
      { status: 400 }
    );
  }

  const formId = body.formId != null ? String(body.formId).trim() : "";

  if (!formId || !/^\d+$/.test(formId)) {
    return NextResponse.json(
      { message: "A numeric Fluent Forms formId is required." },
      { status: 400 }
    );
  }

  if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) {
    return NextResponse.json(
      { message: "Fluent Forms submission data is required." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${wordpressBaseUrl}/wp-json/react-shop/v1/fluent-form/${formId}/submit`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form_id: formId,
          data: body.data,
        }),
        cache: "no-store",
      }
    );

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? ((await response.json()) as Record<string, unknown>)
      : { message: await response.text() };

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            typeof payload.message === "string"
              ? payload.message
              : `WordPress returned ${response.status} while submitting Fluent Form ${formId}.`,
          details: payload,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "React could not reach WordPress to submit the Fluent Form." },
      { status: 502 }
    );
  }
}
