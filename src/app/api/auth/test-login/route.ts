import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
import type { ApiResponse } from "@/types";

/**
 * Dev-only test login route for E2E tests.
 * Creates a JWT session for a test user without going through Google OAuth.
 * Gated behind NODE_ENV !== 'production'.
 */
export async function POST() {
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

  const testUser = {
    id: "test-user-e2e",
    name: "E2E Test User",
    email: "e2e-test@example.com",
    image: null,
  };

  // In dev/test, the cookie is unprefixed
  const cookieName = "authjs.session-token";

  const token = await encode({
    token: {
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
      picture: testUser.image,
      sub: testUser.id,
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
