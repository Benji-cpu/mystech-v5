import { requireAuth } from "@/lib/auth/helpers";
import { getUserChronicleDeck } from "@/lib/db/queries";
import { HomeRadioView } from "@/components/home/radio-nav-nodes";

export default async function HomePage() {
  const user = await requireAuth();
  const chronicleDeck = await getUserChronicleDeck(user.id!);

  return <HomeRadioView chronicleDeckId={chronicleDeck?.id ?? null} />;
}
