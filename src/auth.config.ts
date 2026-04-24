import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

// Build provider list conditionally — Resend magic-link is only enabled when
// RESEND_API_KEY is set, so dev without email still works.
const providers: NextAuthConfig["providers"] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }),
];

if (process.env.RESEND_API_KEY) {
  providers.push(
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? "MysTech <hello@mystech.app>",
    }),
  );
}

export default {
  trustHost: true,
  providers,
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
