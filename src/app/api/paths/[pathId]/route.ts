import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getPathWithRetreatsAndWaypoints } from "@/lib/db/queries-paths";
import type { ApiResponse, PathWithRetreats } from "@/types";

type Params = { params: Promise<{ pathId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { pathId } = await params;

  try {
    const path = await getPathWithRetreatsAndWaypoints(pathId);

    if (!path) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Path not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<PathWithRetreats>>({
      success: true,
      data: path,
    });
  } catch (error) {
    console.error("[GET /api/paths/[pathId]]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to load path" },
      { status: 500 }
    );
  }
}
