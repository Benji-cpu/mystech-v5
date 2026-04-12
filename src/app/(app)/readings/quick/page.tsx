import { requireAuth } from "@/lib/auth/helpers";
import { QuickDraw } from "@/components/readings/quick-draw";

export default async function QuickDrawPage() {
  await requireAuth();
  return <QuickDraw />;
}
