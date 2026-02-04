import { PricingCards } from "@/components/marketing/pricing-cards";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Simple pricing</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <PricingCards />
    </div>
  );
}
