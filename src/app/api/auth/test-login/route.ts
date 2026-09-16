import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { ApiResponse } from "@/types";

/**
 * Dev-only test login route for E2E tests.
 * Creates a JWT session for a test user without going through Google OAuth.
 * Gated behind NODE_ENV !== 'production'.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Not available in production" },
      { status: 404 }
    );
  }

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "AUTH_SECRET not configured" },
      { status: 500 }
    );
  }

  // Optional dev-only body `{ email }` mints a session for a DIFFERENT test user,
  // so a walk can start from a genuinely fresh account (no decks, no plan).
  // Only *@example.com addresses are accepted; the id is derived from the email.
  // `role` (admin | tester | user) is honoured only for such a fresh example.com
  // user, so a local session can exercise the admin screens against real rows.
  let requestedEmail: string | null = null;
  let requestedRole: "admin" | "tester" | "user" | null = null;
  try {
    const body = (await request.json()) as { email?: unknown; role?: unknown };
    if (typeof body?.email === "string" && /^[a-z0-9.+-]+@example\.com$/i.test(body.email)) {
      requestedEmail = body.email.toLowerCase();
      if (body.role === "admin" || body.role === "tester" || body.role === "user") {
        requestedRole = body.role;
      }
    }
  } catch {
    // no body — default test user
  }

  const testUser = requestedEmail
    ? {
        id: `test-${requestedEmail.split("@")[0].replace(/[^a-z0-9]/g, "-")}`,
        name: "Fresh Test User",
        email: requestedEmail,
        image: null,
      }
    : {
        id: "test-user-e2e",
        name: "E2E Test User",
        email: "e2e-test@example.com",
        image: null,
      };

  // Ensure the test user exists in the database
  await db
    .insert(users)
    .values({
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
      image: testUser.image,
    })
    .onConflictDoNothing();

  // Read actual role from DB (may have been updated for testing)
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, testUser.id));
  const role = requestedRole ?? dbUser?.role ?? "user";

  // In dev/test, the cookie is unprefixed
  const cookieName = "authjs.session-token";

  const token = await encode({
    token: {
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
      picture: testUser.image,
      sub: testUser.id,
      role,
    },
    secret,
    salt: cookieName,
    maxAge: 60 * 60, // 1 hour
  });

  const cookieStore = await cookies();

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return NextResponse.json<ApiResponse<typeof testUser>>({
    success: true,
    data: testUser,
  });
}
