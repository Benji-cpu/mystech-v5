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
} satisfies NextAuthConfig;
