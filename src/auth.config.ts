import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export default {
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
      const isOnApp = nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/decks") ||
        nextUrl.pathname.startsWith("/readings") ||
        nextUrl.pathname.startsWith("/person-cards") ||
        nextUrl.pathname.startsWith("/art-styles") ||
        nextUrl.pathname.startsWith("/settings");
      const isOnLogin = nextUrl.pathname === "/login";

      if (isOnApp) {
        if (isLoggedIn) return true;
        return false; // Redirect to /login
      }

      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
