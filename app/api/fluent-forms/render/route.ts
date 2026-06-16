import { NextRequest, NextResponse } from "next/server";
import { getFluentFormsBaseUrl } from "@/lib/wordpressUrl";

type FluentFormResponse = {
  html?: string;
  scripts?: string[];
  styles?: string[];
  inlineScripts?: string[];
};

function uniqueAssets(values: unknown[]) {
  return Array.from(
    new Set(
      values.filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0
      )
    )
  );
}

export async function GET(request: NextRequest) {
  const formId = request.nextUrl.searchParams.get("formId")?.trim();
  const wordpressBaseUrl = getFluentFormsBaseUrl();

  if (!wordpressBaseUrl) {
    return NextResponse.json(
      {
        message:
          "Fluent Forms WordPress URL is not configured. Add FLUENT_FORMS_SITE_URL, WORDPRESS_SITE_URL, or WC_API_URL.",
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

    const html = payload?.html ?? "";
    const rendersPhoneField = /class=["'][^"']*ff-el-phone/i.test(html);
    const expectsPhoneField = /["']phone["']\s*:\s*\{/i.test(html);
    const providedScripts = Array.isArray(payload?.scripts)
      ? payload.scripts
      : [];
    const providedStyles = Array.isArray(payload?.styles) ? payload.styles : [];
    const coreStyles = [
      `${wordpressBaseUrl}/wp-content/plugins/fluentform/assets/css/fluent-forms-public.css`,
      `${wordpressBaseUrl}/wp-content/plugins/fluentform/assets/css/fluentform-public-default.css`,
    ];
    const phoneStyles = rendersPhoneField
      ? [
          `${wordpressBaseUrl}/wp-content/plugins/fluentformpro/public/libs/intl-tel-input/css/intlTelInput.min.css`,
        ]
      : [];
    const phoneScripts = rendersPhoneField
      ? [
          `${wordpressBaseUrl}/wp-content/plugins/fluentformpro/public/libs/intl-tel-input/js/intlTelInputWithUtils.min.js`,
        ]
      : [];

    return NextResponse.json({
      html,
      scripts: uniqueAssets(
        providedScripts.length ? providedScripts : phoneScripts
      ),
      styles: uniqueAssets(
        providedStyles.length
          ? providedStyles
          : [...coreStyles, ...phoneStyles]
      ),
      inlineScripts: Array.isArray(payload?.inlineScripts)
        ? payload.inlineScripts
        : [],
      sourceUrl: wordpressBaseUrl,
      diagnostics: {
        expectsPhoneField,
        rendersPhoneField,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "React could not reach WordPress to render the Fluent Form." },
      { status: 502 }
    );
  }
}
