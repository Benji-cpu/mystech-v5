import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { auth } from "@/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar user={session?.user} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
