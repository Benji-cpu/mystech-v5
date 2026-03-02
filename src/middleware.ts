import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/decks/:path*",
    "/readings/:path*",
    "/explore/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
  ],
};
