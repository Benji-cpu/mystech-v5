/**
 * POST /api/admin/print-orders/[orderId]/print-pack
 *
 * Admin endpoint: forges (or re-forges) the print-pack manifest for an order
 * and returns the manifest URL. Used by the admin queue's "Get pack" button.
 */
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/helpers";
import { forgePrintPack } from "@/lib/print/forge-pack";

export const maxDuration = 30;

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { orderId } = await ctx.params;
  const result = await forgePrintPack(orderId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ data: result });
}
