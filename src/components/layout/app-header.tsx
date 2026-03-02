"use client";

import { SiteHeader } from "./site-header";
import { UserMenu } from "./user-menu";
import { AppSidebar } from "./app-sidebar";
import { VoiceToggle } from "@/components/voice/voice-toggle";

interface AppHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <SiteHeader
      logoHref="/dashboard"
      showLogoOnDesktop={false}
      sidebarContent={<AppSidebar />}
      rightContent={
        <>
          <VoiceToggle />
          <UserMenu user={user} />
        </>
      }
    />
  );
}
