import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserProfile, updateUserProfile } from "@/lib/db/queries";
import type { ApiResponse, UserProfile } from "@/types";

import { parseBody } from "@/lib/api/validate";
import { UpdateUserProfileSchema } from "@/lib/api/schemas";
export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const profile = await getUserProfile(user.id);
  if (!profile) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResponse<UserProfile>>({
    success: true,
    data: profile,
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await parseBody(request, UpdateUserProfileSchema);
  if (!parsed.ok) return parsed.response;
  const { displayName, bio } = parsed.data as {
    displayName?: string;
    bio?: string;
  };

  // Validate bio length
  if (bio !== undefined && bio.length > 500) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Bio must be 500 characters or less" },
      { status: 400 }
    );
  }

  // Validate display name length
  if (displayName !== undefined && displayName.length > 100) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Display name must be 100 characters or less" },
      { status: 400 }
    );
  }

  // Build update data
  const updateData: { displayName?: string | null; bio?: string | null } = {};

  if (displayName !== undefined) {
    // Trim + collapse multiple spaces; empty string → null
    const cleaned = displayName.trim().replace(/\s+/g, " ");
    updateData.displayName = cleaned || null;
  }

  if (bio !== undefined) {
    updateData.bio = bio.trim() || null;
  }

  const updated = await updateUserProfile(user.id, updateData);

  return NextResponse.json<ApiResponse<UserProfile>>({
    success: true,
    data: updated!,
  });
}
