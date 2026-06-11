import { redirect } from "next/navigation";

/** Legacy route — the daily chronicle ritual now lives at /today. */
export default function ChronicleTodayPage() {
  redirect("/today");
}
