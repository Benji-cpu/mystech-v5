import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserPlan } from "@/lib/db/queries";
import { EditorialShell, EditorialHeader } from "@/components/editorial";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mystech-v5.vercel.app";

export const metadata: Metadata = {
  title: "Pricing — MysTech",
  description: "Free forever. Pro at $4.99/month for deeper readings and every spread.",
  alternates: { canonical: `${APP_URL}/pricing` },
  openGraph: {
    title: "Pricing — MysTech",
    description: "Free forever. Pro at $4.99/month for deeper readings and every spread.",
    url: `${APP_URL}/pricing`,
  },
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  const currentPlan = user?.id ? await getUserPlan(user.id) : null;

  return (
    <EditorialShell>
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-16 sm:px-10 sm:pt-24">
        <div className="mb-14 text-center">
          <EditorialHeader
            eyebrow="Pricing"
            title="Simple pricing"
            whisper="Start free. Upgrade when you need more."
            size="xl"
            className="items-center text-center"
          />
        </div>

        <PricingCards isAuthenticated={!!user} currentPlan={currentPlan} />
      </div>
    </EditorialShell>
  );
}
