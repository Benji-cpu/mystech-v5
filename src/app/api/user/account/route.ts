import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getAllUserImageUrls, deleteUser } from "@/lib/db/queries";
import { del } from "@vercel/blob";
import type { ApiResponse } from "@/types";

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  if (body.confirmation !== "DELETE") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Please type DELETE to confirm account deletion" },
      { status: 400 }
    );
  }

  // TODO: Cancel Stripe subscription when billing is integrated

  // Best-effort cleanup of images from Vercel Blob
  const imageUrls = await getAllUserImageUrls(user.id);
  if (imageUrls.length > 0) {
    try {
      await del(imageUrls);
    } catch {
      // Best-effort: don't block deletion if blob cleanup fails
    }
  }

  // CASCADE will delete decks, cards, readings, sessions, accounts, etc.
  await deleteUser(user.id);

  return NextResponse.json<ApiResponse<{ deleted: true }>>({
    success: true,
    data: { deleted: true },
  });
}
