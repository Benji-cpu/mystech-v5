import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export default {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith("/home") ||
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/decks") ||
        nextUrl.pathname.startsWith("/readings") ||
        nextUrl.pathname.startsWith("/art-styles") ||
        nextUrl.pathname.startsWith("/chronicle") ||
        nextUrl.pathname.startsWith("/paths") ||
        nextUrl.pathname.startsWith("/settings") ||
        nextUrl.pathname.startsWith("/onboarding");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLogin = nextUrl.pathname === "/login";

      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false;
      }

      if (isOnApp) {
        if (isLoggedIn) return true;
        return false; // Redirect to /login
      }

      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/home", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
