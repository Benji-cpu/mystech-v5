import { NextResponse } from "next/server";
import { z } from "zod";
import { put, del } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth/helpers";
import type { ApiResponse } from "@/types";

const MAX_BYTES = 1.5 * 1024 * 1024;
const MAX_DELETE_URLS = 3;

function pathPrefixForUser(userId: string) {
  return `studio/reference-images/${userId}/`;
}

function ownsBlobUrl(url: string, userId: string): boolean {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("blob.vercel-storage.com")) return false;
    const path = u.pathname.replace(/^\/+/, "");
    return path.startsWith(pathPrefixForUser(userId));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid form data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Missing file" },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "File must be an image" },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Empty file" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Image too large after compression" },
      { status: 413 },
    );
  }

  const ext = file.type === "image/webp" ? "webp" : "jpg";
  const pathname = `${pathPrefixForUser(user.id)}${randomUUID()}.${ext}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });

    return NextResponse.json<ApiResponse<{ url: string; pathname: string }>>(
      { success: true, data: { url: blob.url, pathname: blob.pathname } },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/studio/reference-upload]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Upload failed" },
      { status: 500 },
    );
  }
}

const deleteBodySchema = z.object({
  urls: z.array(z.string().url()).min(1).max(MAX_DELETE_URLS),
});

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = deleteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  const owned = parsed.data.urls.filter((u) => ownsBlobUrl(u, user.id));

  await Promise.allSettled(
    owned.map(async (url) => {
      try {
        await del(url);
      } catch (err) {
        console.error("[DELETE /api/studio/reference-upload] del failed", url, err);
      }
    }),
  );

  return NextResponse.json<ApiResponse<{ deleted: number }>>({
    success: true,
    data: { deleted: owned.length },
  });
}
