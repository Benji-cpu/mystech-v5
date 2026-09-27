import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth.js session cookies: `__Secure-` over https, bare on http (dev), and
 * split into `.0`, `.1`… when the JWT is large.
 */
const SESSION_COOKIE_PREFIXES = ["__Secure-authjs.session-token", "authjs.session-token"];

export default function middleware(req: NextRequest) {
  // Every matched path but /login needs a session, and a visitor without one
  // goes to /login carrying where they were going — the daily-card email's
  // link must land on the card after sign-in, not on /today.
  //
  // This checks for the session cookie rather than decoding it. Running
  // NextAuth here meant running its config without the database adapter, and
  // the Resend magic-link provider refuses that ("MissingAdapter"): every
  // request errored, `req.auth` came back as the error object, and nobody was
  // ever redirected with `next`. A stale or forged cookie still reaches the
  // page, whose own requireAuth() sends it to /login.
  const hasSession = req.cookies
    .getAll()
    .some((c) => SESSION_COOKIE_PREFIXES.some((prefix) => c.name.startsWith(prefix)));
  if (!hasSession && req.nextUrl.pathname !== "/login") {
    const login = req.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(login);
  }

  // Forward the pathname as a header so server components can read it
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/today/:path*",
    "/today",
    "/story/:path*",
    "/story",
    "/profile/:path*",
    "/decks/:path*",
    "/readings/:path*",
    "/daily",
    "/studio/:path*",
    "/chronicle/:path*",
    "/chronicle",
    "/settings/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/onboarding",
    "/login",
  ],
};
