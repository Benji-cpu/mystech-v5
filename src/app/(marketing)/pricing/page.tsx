import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserPlan } from "@/lib/db/queries";

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
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-display">Simple pricing</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <PricingCards isAuthenticated={!!user} currentPlan={currentPlan} />
    </div>
  );
}
