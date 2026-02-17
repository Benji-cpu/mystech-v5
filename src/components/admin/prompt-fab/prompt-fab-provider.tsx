"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { getRouteMappingForPath } from "./prompt-mapping";
import { PromptFab } from "./prompt-fab";

export function PromptFabProvider() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = session?.user?.role;
  if (role !== "admin" && role !== "tester") return null;

  const mapping = getRouteMappingForPath(pathname);
  if (!mapping) return null;

  return (
    <PromptFab
      promptKeys={mapping.keys}
      schemaKeys={mapping.schemas ?? []}
      label={mapping.label}
      isAdmin={role === "admin"}
      userEmail={session?.user?.email}
    />
  );
}
