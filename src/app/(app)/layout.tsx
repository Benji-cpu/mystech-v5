import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ImmersiveShell } from "@/components/immersive/immersive-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ImmersiveShell user={session.user}>
      {children}
    </ImmersiveShell>
  );
}
