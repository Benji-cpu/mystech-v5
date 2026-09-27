import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: NextRequest & { auth: unknown }) => {
  // Every matched path but /login needs a session. This has to live here:
  // once auth() is given a function, NextAuth ignores a `false` from the
  // `authorized` callback, so signed-out visitors fell through to the page's
  // own redirect("/login") and lost where they were going — the daily-card
  // email's link landed on /today after sign-in instead of on the card.
  if (!req.auth && req.nextUrl.pathname !== "/login") {
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
});

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
