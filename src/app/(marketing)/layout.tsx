import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { FeedbackFab } from "@/components/feedback/feedback-fab";
import { getCurrentUser } from "@/lib/auth/helpers";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="daylight flex min-h-screen flex-col" style={{ background: "var(--paper)" }}>
      <MarketingNavbar user={user} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <FeedbackFab />
    </div>
  );
}
