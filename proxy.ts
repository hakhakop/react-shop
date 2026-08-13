import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// The layout consumes x-current-path only for document requests. Keeping the
// proxy off Next internals, API handlers, and file-like resources prevents
// HMR/static requests from re-entering the document graph.
export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next(?:/|$)|favicon\\.ico$|robots\\.txt$|sitemap(?:\\.[^/]+)?$|.*\\.[^/]+$).*)",
  ],
};
