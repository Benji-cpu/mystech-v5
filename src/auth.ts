import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import authConfig from "./auth.config";
import { captureServer, identifyServer, ANALYTICS_EVENTS } from "@/lib/analytics";
import { sendWelcomeEmail } from "@/lib/email/send";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      // On sign-in or session update, fetch displayName from DB
      if ((user || trigger === "update") && token.id) {
        try {
          const [row] = await db
            .select({ displayName: users.displayName })
            .from(users)
            .where(eq(users.id, token.id as string))
            .limit(1);
          token.displayName = row?.displayName ?? null;
        } catch {
          // DB unavailable — keep existing value
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      session.user.role = (token.role as string) ?? "user";
      session.user.displayName = (token.displayName as string) ?? null;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      identifyServer(user.id, {
        email: user.email ?? undefined,
        name: user.name ?? undefined,
      });
      captureServer(ANALYTICS_EVENTS.SIGNUP_COMPLETED, user.id, {
        email: user.email ?? null,
      });
      if (user.email) {
        sendWelcomeEmail({ to: user.email, name: user.name }).catch(() => {});
      }
    },
    async signIn({ user, isNewUser }) {
      if (!user.id || isNewUser) return;
      captureServer(ANALYTICS_EVENTS.LOGIN_COMPLETED, user.id);
    },
  },
});
