import { redirect } from "next/navigation";

/** Legacy route — reading history now lives in the Story page. */
export default function ReadingsPage() {
  redirect("/story");
}
