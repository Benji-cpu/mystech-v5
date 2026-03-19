import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserPlan } from "@/lib/db/queries";
import {
  getPracticeForWaypoint,
  getPracticeSegments,
  getUserPracticeProgressRecord,
} from "@/lib/db/queries-paths";
import type { ApiResponse, PracticeWithSegments, PracticeSegment, UserPracticeProgress } from "@/types";

const paramsSchema = z.object({
  waypointId: z.string().min(1),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ waypointId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } satisfies ApiResponse<never>,
      { status: 401 }
    );
  }

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid waypointId" } satisfies ApiResponse<never>,
      { status: 400 }
    );
  }

  const { waypointId } = parsed.data;

  try {
    const plan = await getUserPlan(user.id);
    const practice = await getPracticeForWaypoint(waypointId, user.id, plan);

    if (!practice) {
      return NextResponse.json(
        { success: true, data: { practice: null, progress: null } } satisfies ApiResponse<{ practice: null; progress: null }>,
      );
    }

    const [segments, progress] = await Promise.all([
      getPracticeSegments(practice.id),
      getUserPracticeProgressRecord(user.id, practice.id),
    ]);

    const practiceWithSegments: PracticeWithSegments = {
      ...practice,
      segments: segments.map((s) => ({
        ...s,
        segmentType: s.segmentType as PracticeSegment["segmentType"],
      })),
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          practice: practiceWithSegments,
          progress: progress as UserPracticeProgress | null,
        },
      } satisfies ApiResponse<{ practice: PracticeWithSegments; progress: UserPracticeProgress | null }>,
    );
  } catch (err) {
    console.error("[practices/GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load practice" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
