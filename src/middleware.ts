import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: NextRequest & { auth: unknown }) => {
  // Forward the pathname as a header so server components can read it
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/decks/:path*",
    "/readings/:path*",
    "/explore/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/onboarding",
    "/login",
  ],
};
