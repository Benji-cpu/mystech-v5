"use client";

import { SiteHeader } from "./site-header";
import { UserMenu } from "./user-menu";
import { AppSidebar } from "./app-sidebar";

interface AppHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <SiteHeader
      logoHref="/dashboard"
      showLogoOnDesktop={false}
      sidebarContent={<AppSidebar />}
      rightContent={<UserMenu user={user} />}
    />
  );
}
