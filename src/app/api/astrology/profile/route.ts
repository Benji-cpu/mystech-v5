import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { astrologyProfiles } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { calculateBirthChart } from "@/lib/astrology/birth-chart";
import type { ApiResponse, AstrologyProfile } from "@/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const [profile] = await db
    .select()
    .from(astrologyProfiles)
    .where(eq(astrologyProfiles.userId, user.id));

  if (!profile) {
    return NextResponse.json<ApiResponse<null>>(
      { success: true, data: null }
    );
  }

  return NextResponse.json<ApiResponse<AstrologyProfile>>(
    { success: true, data: profile as AstrologyProfile }
  );
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const {
    birthDate,
    birthHour,
    birthMinute,
    birthLatitude,
    birthLongitude,
    birthLocationName,
    spiritualInterests,
  } = body as {
    birthDate: string; // ISO date string
    birthHour?: number | null;
    birthMinute?: number | null;
    birthLatitude?: string | null;
    birthLongitude?: string | null;
    birthLocationName?: string | null;
    spiritualInterests?: string[] | null;
  };

  if (!birthDate) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "birthDate is required" },
      { status: 400 }
    );
  }

  const date = new Date(birthDate);
  if (isNaN(date.getTime())) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid birthDate" },
      { status: 400 }
    );
  }

  const birthTimeKnown = birthHour != null;
  const lat = birthLatitude ? parseFloat(birthLatitude) : undefined;
  const lng = birthLongitude ? parseFloat(birthLongitude) : undefined;

  // Calculate birth chart
  const chart = calculateBirthChart({
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    hour: birthTimeKnown ? (birthHour ?? undefined) : undefined,
    minute: birthTimeKnown ? (birthMinute ?? undefined) : undefined,
    latitude: lat,
    longitude: lng,
  });

  const profileData = {
    userId: user.id,
    birthDate: date,
    birthTimeKnown,
    birthHour: birthHour ?? null,
    birthMinute: birthMinute ?? null,
    birthLatitude: birthLatitude ?? null,
    birthLongitude: birthLongitude ?? null,
    birthLocationName: birthLocationName ?? null,
    sunSign: chart.sunSign,
    moonSign: chart.moonSign,
    risingSign: chart.risingSign,
    planetaryPositions: chart.planetaryPositions,
    elementBalance: chart.elementBalance,
    spiritualInterests: spiritualInterests ?? null,
    updatedAt: new Date(),
  };

  // Upsert: insert or update existing profile
  const [profile] = await db
    .insert(astrologyProfiles)
    .values(profileData)
    .onConflictDoUpdate({
      target: astrologyProfiles.userId,
      set: profileData,
    })
    .returning();

  return NextResponse.json<ApiResponse<AstrologyProfile>>(
    { success: true, data: profile as AstrologyProfile }
  );
}
