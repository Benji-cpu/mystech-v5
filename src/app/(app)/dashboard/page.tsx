import { redirect } from "next/navigation";

/** Dashboard content lives on Profile. Redirect for backwards compatibility. */
export default function DashboardPage() {
  redirect("/profile");
}
